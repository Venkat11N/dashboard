import { useState, useEffect } from "react";
import { supabase } from "../../lib/supabase";
import { useNavigate } from "react-router-dom";
import { FileText, ShieldCheck, Hash, CreditCard, User, Mail, ChevronRight, AlertCircle, Check } from "lucide-react";
import { getAllCategories, getSubcategories } from "../../services/CategoryService";
import type { Category, Subcategory } from "../../services/CategoryService";

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
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data: profileData } = await supabase.from('profiles').select('*').eq('id', user.id).single();
      if (profileData) setProfile(profileData);
      setCategories(await getAllCategories());
    }
    prepareForm();
  }, []);

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
      
      // Auto-trigger dropdown opening once subs are loaded
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
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Session expired.");
      const refNo = `GRV-${Date.now().toString().slice(-6)}`;
      const { data: grievance, error: gError } = await supabase.from('grievances').insert({
        reference_number: refNo, user_id: session.user.id, indos_number: profile.indos_number,
        first_name: profile.first_name, last_name: profile.last_name,
        category_id: selectedCategory.id, subcategory_id: selectedSubcategory.id,
        description: descriptionHtml, status: 'SUBMITTED'
      }).select().single();
      if (gError) throw gError;
      if (files.length > 0 && grievance) {
        for (const file of files) {
          const fileName = `${grievance.id}/${Math.random().toString(36).substring(7)}.${file.name.split('.').pop()}`;
          const { error: uploadError } = await supabase.storage.from('grievance-attachments').upload(fileName, file);
          if (!uploadError) {
            const { data: { publicUrl } } = supabase.storage.from('grievance-attachments').getPublicUrl(fileName);
            await supabase.from('grievance_files').insert({ grievance_id: grievance.id, file_url: publicUrl });
          }
        }
      }
      navigate("/dashboard/application-status", { state: { refNumber: refNo, categoryName: selectedCategory.name } });
    } catch (err: any) { alert(err.message); } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50">
      <div className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-6 py-5 flex items-center gap-4">
          <div className="p-3 bg-slate-900 rounded-xl shadow-lg"><FileText className="text-white" size={24} /></div>
          <div><h1 className="text-2xl font-bold text-slate-900">Submit Grievance</h1><p className="text-slate-500 text-sm">File a new complaint or grievance</p></div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-8">
        <form onSubmit={(e) => { e.preventDefault(); if (isFormValid) setShowConfirm(true); }} className="space-y-6">
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

          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
            <h2 className="font-semibold text-slate-800 mb-4">Supporting Documents</h2>
            <FileDropZone files={files} onFilesAdd={(newFiles) => setFiles(prev => [...prev, ...newFiles.filter(f => f.size <= 5 * 1024 * 1024)])} onFileRemove={(idx) => setFiles(prev => prev.filter((_, i) => i !== idx))} />
          </div>

          <button type="submit" disabled={!isFormValid || loading} className={`w-full inline-flex items-center justify-center gap-2 font-semibold py-4 rounded-xl shadow-lg transition-all ${isFormValid && !loading ? 'bg-slate-900 text-white hover:bg-slate-800' : 'bg-slate-300 text-white cursor-not-allowed'}`}>
            {loading ? 'Processing...' : <><Check size={18} /> Submit Application</>}
          </button>
        </form>
      </div>

      {showConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden animate-in">
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

      <style>{`
        .ProseMirror p.is-editor-empty:first-child::before { content: attr(data-placeholder); float: left; color: #9ca3af; pointer-events: none; height: 0; }
        .ProseMirror:focus { outline: none; }
        .ProseMirror ul, .ProseMirror ol { padding-left: 1.5rem; }
        .ProseMirror ul { list-style-type: disc; }
        .ProseMirror ol { list-style-type: decimal; }
        .animate-in { animation: zoom-in-95 0.2s ease-out; }
        @keyframes zoom-in-95 { from { transform: scale(0.95); opacity: 0; } to { transform: scale(1); opacity: 1; } }
      `}</style>
    </div>
  );
}