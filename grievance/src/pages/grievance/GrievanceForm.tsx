import React, { useState, useEffect } from "react";
import { useGovernance } from "../../core/GovernanceContext";
import { useSeafarerData } from "../../hooks/useSeafarerData";
import PersonalDetails from "../../components/grievance/PersonalDetails";
import CategorySearch from "../../components/grievance/CategorySearch";
import SubcategoryDropdown from "../../components/grievance/SubCategoryDropdown";
import DescriptionEditor from "../../components/grievance/DescriptionEditor";
import FileUploader from "../../components/grievance/FileUploader";
import DashboardLayout from "../../components/layout/DashboardLayout";
import { supabase } from '../../lib/supabase'
import { Category } from "../../services/CategoryService";
import { useNavigate } from "react-router-dom";

export default function GrievanceForm() {
  const navigate = useNavigate();
  const { user } = useGovernance(); 
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const { data: preFetchedData } = useSeafarerData(user.indosNumber || "");

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    cdcNumber: "",
    dob: "",
    description: "",
  });

  const [category, setCategory] = useState<Category | null>(null);
  const [subcategory, setSubcategory] = useState("");


  const handleSubmit = async () => {
    if (!category || !subcategory || !formData.description) {
      alert("Please fill in all required fields.");
      return;
    }

    setIsSubmitting(true);
    try {
      const uploadedUrls = [];
      for (const file of files) {
        const fileExt = file.name.split('.').pop();
        const fileName = `${user.indosNumber}_${Date.now()}.${fileExt}`;
        const {data: uploadData, error: uploadError } = await supabase.storage
          .from('attachments')
          .upload(fileName, file);

          if (uploadError) throw uploadError;

          const { data: urlData } = supabase.storage
          .from('attachments')
          .getPublicUrl(fileName);
         uploadedUrls.push(urlData.publicUrl);
      }
      const refNumber = `GRV-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

      const { error: dbError } = await supabase
        .from('grievance')
        .insert([{
          reference_number: refNumber,
          indos_number: user.indosNumber,
          first_name: formData.firstName,
          last_name: formData.lastName,
          cdc_number: formData.cdcNumber,
          dob: formData.dob,
          category_id: category.id,
          subcategory_name: subcategory,
          description: formData.description,
          attachment_urls: uploadedUrls,
          status: 'SUBMITTED'
        }]);

        if (dbError) throw dbError;

        alert(`Grievance submitted! Your Ref No: ${refNumber}`);
        navigate('/dashbaord/grievances/success', {
          state: {
            refNumber: refNumber,
            categoryName:category?.name
          }
        });

      } catch (error: any) {
        console.error("Submission failed:", error.message);
        alert("Error submitting grievacne. Please try again.")
      } finally {
        setIsSubmitting(false);
      }
    };

  const handleCategorySelect = (cat: Category) => {
    setCategory(cat);
    setSubcategory(""); 
  };

  useEffect(() => {
    if (preFetchedData) {
      setFormData(prev => ({
        ...prev,
        firstName: preFetchedData.first_name,
        lastName: preFetchedData.last_name,
        cdcNumber: preFetchedData.cdc_number,
        dob: preFetchedData.date_of_birth,
      }));
    }
  }, [preFetchedData]);

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500">
        <header>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">File a Grievance</h1>
          <p className="text-slate-500">INDOS: <span className="font-mono font-bold text-blue-600">{user.indosNumber}</span></p>
        </header>

        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-2xl space-y-8">
          <section>
            <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 px-1">Seafarer Profile (Verified)</h2>
            <PersonalDetails formData={formData} />
          </section>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

            <CategorySearch onSelect={handleCategorySelect} />
            <SubcategoryDropdown categoryId={category?.id || null} onSelect={setSubcategory} />
          </div>

          <DescriptionEditor 
            description={formData.description} 
            onDescriptionChange={(val: string) => setFormData({...formData, description: val})} 
          />

          <FileUploader files={files} setFiles={setFiles} />

          <button 
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="w-full py-5 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-black uppercase tracking-widest text-xs shadow-xl shadow-blue-900/20 transition-all"
            >
            {isSubmitting ? "Processing..." : "Submit Application"}
          </button>
        </div>
      </div>
    </DashboardLayout>
  );
}