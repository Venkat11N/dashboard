import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase"
import { useNavigate } from "react-router-dom";
import { FileText, ShieldCheck, Hash, CreditCard, User, Mail, ChevronRight } from "lucide-react";

// Components
import { RichTextEditor } from "../components/grievance/RichTextEditor";
import { SearchableDropdown } from "../components/ui/SearchableDropdown";
import { FileDropZone } from "../components/grievance/FileDropZone";

import { getAllCategories, getSubcategories } from "../services/CategoryService";
import type { Category, Subcategory } from "../services/CategoryService";

export default function GrievanceForm() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState<any>(null);
  
  // State for logic
  const [categories, setCategories] = useState<Category[]>([]);
  const [subcategories, setSubcategories] = useState<Subcategory[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [selectedSubcategory, setSelectedSubcategory] = useState<Subcategory | null>(null);
  const [descriptionHtml, setDescriptionHtml] = useState("");
  const [descriptionText, setDescriptionText] = useState("");
  const [files, setFiles] = useState<File[]>([]);

  // Fetch initial data
  useEffect(() => {
    async function init() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data: p } = await supabase.from('profiles').select('*').eq('id', user.id).single();
      setProfile(p);
      setCategories(await getAllCategories());
    }
    init();
  }, []);

  // Fetch subs on category change
  useEffect(() => {
    if (selectedCategory) {
      getSubcategories(selectedCategory.id).then(setSubcategories);
      setSelectedSubcategory(null);
    }
  }, [selectedCategory]);

const handleFinalSubmit = async () => {
    // 1. Validation Checks
    if (!profile || !selectedCategory || !selectedSubcategory) {
      alert("Please complete all required fields.");
      return;
    }
    
    setLoading(true);
    setShowConfirm(false);

    try {
      // 2. Session Verification
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Session expired. Please log in again.");

      // 3. Generate Official Reference Number
      const refNo = `GRV-${Date.now().toString().slice(-6)}`;

      // 4. Insert Main Grievance Record
      const { data: grievance, error: gError } = await supabase
        .from('grievances')
        .insert({
          reference_number: refNo,
          user_id: session.user.id,
          indos_number: profile.indos_number,
          first_name: profile.first_name,
          last_name: profile.last_name,
          category_id: selectedCategory.id,
          subcategory_id: selectedSubcategory.id,
          description: descriptionHtml, 
          status: 'SUBMITTED'
        })
        .select()
        .single();

      if (gError) throw gError;

      // 5. Handle Multiple File Uploads
      if (files.length > 0 && grievance) {
        for (const file of files) {
          // Create unique file path: grievance_id/unique_name.ext
          const fileExt = file.name.split('.').pop();
          const fileName = `${grievance.id}/${Math.random().toString(36).substring(7)}.${fileExt}`;
          
          const { error: uploadError } = await supabase.storage
            .from('grievance-attachments')
            .upload(fileName, file);

          if (!uploadError) {
            // Get Public URL for the uploaded file
            const { data: { publicUrl } } = supabase.storage
              .from('grievance-attachments')
              .getPublicUrl(fileName);

            // Insert reference into grievance_files table
            await supabase.from('grievance_files').insert({
              grievance_id: grievance.id,
              file_url: publicUrl
            });
          } else {
            console.error(`Failed to upload ${file.name}:`, uploadError.message);
          }
        }
      }

      // 6. Navigation to Success Receipt
      navigate("/dashboard/application-status", { 
        state: { 
          refNumber: refNo,
          categoryName: selectedCategory.name
        } 
      });

    } catch (err: any) {
      console.error("Submission Error:", err);
      alert("Submission Failed: " + (err.message || "Unknown error occurred"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b p-6">
         {/* Simple Header Logic */}
      </header>
      
      <main className="max-w-4xl mx-auto p-6 space-y-6">
        {/* Profile Section */}
        <section className="bg-white rounded-xl border p-6">
           {/* Applicant info grid */}
        </section>

        {/* Dropdowns */}
        <div className="grid grid-cols-2 gap-6">
          <SearchableDropdown 
            items={categories} 
            selectedItem={selectedCategory} 
            onSelect={setSelectedCategory} 
            label="Category" 
            placeholder="Search..." 
          />
          <SearchableDropdown 
            items={subcategories} 
            selectedItem={selectedSubcategory} 
            onSelect={setSelectedSubcategory} 
            label="Subcategory" 
            placeholder="Search..." 
            disabled={!selectedCategory} 
          />
        </div>

        {/* Editor */}
        <RichTextEditor 
          content={descriptionHtml} 
          onChange={(html, text) => {
            setDescriptionHtml(html);
            setDescriptionText(text);
          }} 
        />

        {/* Files */}
        <FileDropZone 
          files={files} 
          onFilesAdd={(newFiles) => setFiles([...files, ...newFiles])} 
          onFileRemove={(i) => setFiles(files.filter((_, idx) => idx !== i))} 
        />

        <button 
          onClick={() => setShowConfirm(true)} 
          disabled={descriptionText.length < 10 || !selectedSubcategory}
          className="..."
        >
          Submit Grievance
        </button>
      </main>
    </div>
  );
}