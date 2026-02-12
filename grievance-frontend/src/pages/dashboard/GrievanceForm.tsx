import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FileText, ShieldCheck, Hash, CreditCard, User, Mail, AlertCircle, Check } from "lucide-react";
import { getAllCategories, getSubcategories } from "../../services/CategoryService";
import type { Category, Subcategory } from "../../services/CategoryService";
import { API_BASE_URL } from "../../config/api"; // Centralized config

import { RichTextEditor } from "../../components/grievance/RichTextEditor";
import { SearchableDropdown } from "../../components/ui/SearchableDropdown";
import { FileDropZone } from "../../components/grievance/FileDropZone";

const CHARACTER_LIMIT = 4000;
const MIN_DESCRIPTION_LENGTH = 10;

export default function GrievanceForm() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState<any>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [subcategories, setSubcategories] = useState<Subcategory[]>([]);
  const [subLoading, setSubLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [selectedSubcategory, setSelectedSubcategory] = useState<Subcategory | null>(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const [descriptionHtml, setDescriptionHtml] = useState("");
  const [descriptionLength, setDescriptionLength] = useState(0);
  const [autoOpenSubcategory, setAutoOpenSubcategory] = useState(false);

  useEffect(() => {
    async function prepareForm() {
      try {
        const token = localStorage.getItem('accessToken');
        if (!token) {
          navigate('/login');
          return;
        }

       
        const response = await fetch(`${API_BASE_URL}/profile`, {
          method: 'GET',
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const result = await response.json();
        
        if (result.status === 'ok') {
          setProfile(result.data);
        }

        // Load categories using your existing service
        setCategories(await getAllCategories());
      } catch (err) {
        console.error("Initialization error:", err);
      }
    }
    prepareForm();
  }, [navigate]);

  useEffect(() => {
    async function fetchSubcategories() {
      if (!selectedCategory) { 
        setSubcategories([]); 
        setAutoOpenSubcategory(false);
        return; 
      }
      setSubLoading(true);
      const subs = await getSubcategories(selectedCategory.id);
      setSubcategories(subs);
      setSubLoading(false);
      
      if (subs.length > 0) {
        setTimeout(() => setAutoOpenSubcategory(true), 50);
      }
    }
    fetchSubcategories();
  }, [selectedCategory]);

  const isFormValid = !!profile && !!selectedCategory && !!selectedSubcategory && descriptionLength >= MIN_DESCRIPTION_LENGTH;

  const handleFinalSubmit = async () => {
    if (!profile || !selectedCategory || !selectedSubcategory) return;
    setLoading(true);
    setShowConfirm(false);

    try {
      const token = localStorage.getItem('accessToken');
      
      // 2. Submit to your MySQL backend controller
      // Mapping the frontend state to the backend expectations
      const response = await fetch(`${API_BASE_URL}/submit-grievance`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          indos_number: profile.indos_number,
          first_name: profile.first_name,
          last_name: profile.last_name,
          cdc_number: profile.cdc_number,
          dob: profile.date_of_birth,
          category_id: selectedCategory.id,
          subcategory_id: selectedSubcategory.id,
          subject: selectedSubcategory.name, // Using subcategory name as subject
          description: descriptionHtml,
          priority: 'MEDIUM'
        })
      });

      const result = await response.json();

      if (result.status === 'ok') {
        // Handle file uploads separately if needed, or implement a Multipart form
        navigate("/dashboard/application-status", { 
          state: { 
            refNumber: result.data.reference_number, 
            categoryName: selectedCategory.name 
          } 
        });
      } else {
        throw new Error(result.message);
      }
    } catch (err: any) { 
      alert(err.message || "Failed to submit grievance."); 
    } finally { 
      setLoading(false); 
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50">
      {/* Navbar section */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-6 py-5 flex items-center gap-4">
          <div className="p-3 bg-slate-900 rounded-xl shadow-lg"><FileText className="text-white" size={24} /></div>
          <div><h1 className="text-2xl font-bold text-slate-900">Submit Grievance</h1><p className="text-slate-500 text-sm">File a new complaint or grievance</p></div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-8">
        <form onSubmit={(e) => { e.preventDefault(); if (isFormValid) setShowConfirm(true); }} className="space-y-6">
          {/* Applicant Info Section */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-6 py-4 bg-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-3"><ShieldCheck className="text-slate-300" size={20} /><span className="text-white font-semibold">Applicant Information</span></div>
              <span className="text-xs text-slate-300 bg-white/10 px-2.5 py-1 rounded-full font-medium">{profile ? 'Verified' : 'Loading...'}</span>
            </div>
            <div className="p-6 grid grid-cols-2 md:grid-cols-4 gap-6">
              {[{ icon: Hash, label: 'INDoS No.', value: profile?.indos_number }, { icon: CreditCard, label: 'CDC No.', value: profile?.cdc_number }, { icon: User, label: 'Full Name', value: profile ? `${profile.first_name} ${profile.last_name}` : null }, { icon: Mail, label: 'Email', value: profile?.email }].map((item, idx) => (
                <div key={idx} className="space-y-1"><div className="flex items-center gap-1.5 text-slate-400"><item.icon size={12} /><span className="text-[11px] font-medium uppercase">{item.label}</span></div><p className="font-semibold text-slate-800 truncate">{item.value || '—'}</p></div>
              ))}
            </div>
          </div>

          {/* Dropdown Section */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            <SearchableDropdown items={categories} selectedItem={selectedCategory} onSelect={(item) => { setSelectedCategory(item); setSelectedSubcategory(null); }} label="Category" placeholder="Select..." />
            <SearchableDropdown 
              items={subcategories} 
              selectedItem={selectedSubcategory} 
              onSelect={setSelectedSubcategory} 
              label="Sub-Category" 
              placeholder="Select..." 
              disabled={!selectedCategory} 
              loading={subLoading}
              autoOpen={autoOpenSubcategory}
              onAutoOpenComplete={() => setAutoOpenSubcategory(false)}
            />
          </div>

          {/* Editor Section */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h2 className="font-semibold text-slate-800">Grievance Details</h2>
                <p className="text-sm text-slate-500 mt-0.5">
                  Provide a comprehensive description (min {MIN_DESCRIPTION_LENGTH} characters)
                  {descriptionLength > 0 && (
                    <span className={descriptionLength >= MIN_DESCRIPTION_LENGTH ? 'text-green-600' : 'text-amber-600'}>
                      {' '}— {descriptionLength} entered
                    </span>
                  )}
                </p>
              </div>
              <span className="text-xs text-red-500 font-medium flex items-center gap-1"><AlertCircle size={12} /> Required</span>
            </div>
            <RichTextEditor onChange={(html, text) => { setDescriptionHtml(html); setDescriptionLength(text.trim().length); }} />
          </div>

          {/* Files Section */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
            <h2 className="font-semibold text-slate-800 mb-4">Supporting Documents</h2>
            <FileDropZone files={files} onFilesAdd={(newFiles) => setFiles(prev => [...prev, ...newFiles.filter(f => f.size <= 5 * 1024 * 1024)])} onFileRemove={(idx) => setFiles(prev => prev.filter((_, i) => i !== idx))} />
          </div>

          <button type="submit" disabled={!isFormValid || loading} className={`w-full inline-flex items-center justify-center gap-2 font-semibold py-4 rounded-xl shadow-lg transition-all ${isFormValid && !loading ? 'bg-slate-900 text-white hover:bg-slate-800' : 'bg-slate-300 text-white cursor-not-allowed'}`}>
            {loading ? 'Processing...' : <><Check size={18} /> Submit Application</>}
          </button>
        </form>
      </div>

      {/* Confirmation Modal */}
      {showConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden">
            <div className="px-6 py-5 bg-slate-800 text-center text-white"><ShieldCheck className="mx-auto mb-3" size={28} /><h3 className="text-xl font-bold">Review & Submit</h3></div>
            <div className="p-6 space-y-3">
               <div className="flex justify-between border-b pb-2"><span className="text-sm text-slate-500">Category</span><span className="text-sm font-semibold">{selectedCategory?.name}</span></div>
               <div className="flex justify-between border-b pb-2"><span className="text-sm text-slate-500">Files</span><span className="text-sm font-semibold">{files.length} attached</span></div>
               <button onClick={handleFinalSubmit} disabled={loading} className="w-full bg-slate-900 text-white py-3 rounded-xl font-semibold mt-4">{loading ? 'Submitting...' : 'Confirm Submit'}</button>
               <button onClick={() => setShowConfirm(false)} className="w-full text-slate-500 text-sm font-medium">Go Back</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}