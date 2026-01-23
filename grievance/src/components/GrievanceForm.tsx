import { useState, useEffect } from "react";
import { supabase } from "../../lib/supabase";
import { useNavigate } from "react-router-dom";
import { Upload, CheckCircle2, AlertCircle, ShieldCheck, X } from "lucide-react";

export default function GrievanceForm() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState<any>(null);
  const [categories, setCategories] = useState<any[]>([]);
  const [subcategories, setSubcategories] = useState<any[]>([]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [showConfirm, setShowConfirm] = useState(false); // Confirmation Box State
  
  const [formData, setFormData] = useState({
    subject: "",
    description: "",
    subCategoryId: "",
  });
  const [file, setFile] = useState<File | null>(null);

  useEffect(() => {
    async function prepareForm() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profileData } = await supabase
        .from('profiles')
        .select(`
          *,
          master_ranks(name),
          master_departments(name)
        `)
        .eq('id', user.id)
        .single();
      
      setProfile(profileData);

      const { data: catData } = await supabase.from('grievance_categories').select('*');
      setCategories(catData || []);
    }
    prepareForm();
  }, []);

  useEffect(() => {
    if (selectedCategory) {
      supabase.from('grievance_subcategories')
        .select('*')
        .eq('category_id', selectedCategory)
        .then(({ data }) => setSubcategories(data || []));
    }
  }, [selectedCategory]);

  // Initial trigger that shows the confirmation box
  const handleAttemptSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setShowConfirm(true);
  };

  // The actual final submission function
  async function handleFinalSubmit() {
    setLoading(true);
    setShowConfirm(false);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      const { data: grievance, error: gError } = await supabase
        .from('grievances')
        .insert({
          user_id: user?.id,
          category_id: selectedCategory,
          subcategory_id: formData.subCategoryId,
          subject: formData.subject,
          description: formData.description,
          status: 'PENDING'
        })
        .select().single();

      if (gError) throw gError;

      if (file && grievance) {
        const fileExt = file.name.split('.').pop();
        const fileName = `${grievance.id}/${Math.random()}.${fileExt}`;
        const { error: uploadError } = await supabase.storage
          .from('grievance-attachments').upload(fileName, file);

        if (!uploadError) {
          const { data: { publicUrl } } = supabase.storage.from('grievance-attachments').getPublicUrl(fileName);
          await supabase.from('grievance_files').insert({
            grievance_id: grievance.id,
            file_url: publicUrl
          });
        }
      }
      navigate("/dashboard/application-status");
    } catch (err: any) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-3xl shadow-sm border border-gray-100 relative">
      <h1 className="text-2xl font-bold mb-6 text-gray-900">Submit New Grievance</h1>

      <form onSubmit={handleAttemptSubmit} className="space-y-6">
        
        {/* SEQUENCE: INDoS, CDC, Names, DOB, Email */}
        <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">INDoS Number</label>
            <p className="font-mono font-bold text-blue-600 text-lg">{profile?.indos_number || 'N/A'}</p>
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">CDC Number</label>
            <p className="font-mono font-bold text-blue-600 text-lg">{profile?.cdc_number || 'N/A'}</p>
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">First Name</label>
            <p className="font-semibold text-gray-800">{profile?.first_name}</p>
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Last Name</label>
            <p className="font-semibold text-gray-800">{profile?.last_name}</p>
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Date of Birth</label>
            <p className="font-semibold text-gray-800">{profile?.date_of_birth || 'N/A'}</p>
          </div>
          <div className="space-y-1 md:col-span-2">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Email Address</label>
            <p className="font-semibold text-gray-800">{profile?.email}</p>
          </div>
        </div>

        {/* Category & Sub-Category */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold text-gray-700">Category</label>
            <select 
              className="border p-3 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              required
            >
              <option value="">Select Category</option>
              {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold text-gray-700">Sub-Category</label>
            <select 
              className="border p-3 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              disabled={!selectedCategory}
              value={formData.subCategoryId}
              onChange={(e) => setFormData({...formData, subCategoryId: e.target.value})}
              required
            >
              <option value="">Select Sub-category</option>
              {subcategories.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-sm font-semibold text-gray-700">Subject</label>
          <input 
            className="border p-3 rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Brief title of your grievance"
            value={formData.subject}
            onChange={(e) => setFormData({...formData, subject: e.target.value})}
            required
          />
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-sm font-semibold text-gray-700">Description</label>
          <textarea 
            rows={5}
            className="border p-3 rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Provide detailed information..."
            value={formData.description}
            onChange={(e) => setFormData({...formData, description: e.target.value})}
            required
          />
        </div>

        <div className="border-2 border-dashed border-gray-200 p-8 rounded-2xl flex flex-col items-center gap-2 hover:bg-gray-50 transition-colors cursor-pointer relative">
          <Upload className="text-gray-400" />
          <p className="text-sm text-gray-500 font-medium text-center">Click to upload supporting documents (PDF, JPG)</p>
          <input 
            type="file" 
            className="absolute inset-0 opacity-0 cursor-pointer"
            onChange={(e) => setFile(e.target.files ? e.target.files[0] : null)}
          />
          {file && <span className="text-blue-600 text-xs font-bold uppercase tracking-widest">{file.name} selected</span>}
        </div>

        <button
          type="submit"
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-2xl transition-all shadow-lg shadow-blue-200"
        >
          Proceed to Confirmation
        </button>
      </form>

      {/* CONFIRMATION MODAL OVERLAY */}
      {showConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b flex justify-between items-center bg-slate-50">
              <div className="flex items-center gap-2 text-blue-600">
                <ShieldCheck size={20} />
                <h3 className="font-bold">Confirm Your Submission</h3>
              </div>
              <button onClick={() => setShowConfirm(false)} className="text-slate-400 hover:text-slate-600"><X size={20}/></button>
            </div>
            
            <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div><p className="text-slate-400 text-[10px] uppercase font-bold">INDoS No.</p><p className="font-bold">{profile?.indos_number}</p></div>
                <div><p className="text-slate-400 text-[10px] uppercase font-bold">CDC No.</p><p className="font-bold">{profile?.cdc_number}</p></div>
                <div><p className="text-slate-400 text-[10px] uppercase font-bold">Category</p><p className="font-bold">{categories.find(c => c.id === selectedCategory)?.name}</p></div>
                <div><p className="text-slate-400 text-[10px] uppercase font-bold">Sub-Category</p><p className="font-bold">{subcategories.find(s => s.id === formData.subCategoryId)?.name}</p></div>
              </div>
              <div className="pt-2 border-t">
                <p className="text-slate-400 text-[10px] uppercase font-bold">Subject</p>
                <p className="text-sm font-semibold">{formData.subject}</p>
              </div>
              <div className="pt-2">
                <p className="text-slate-400 text-[10px] uppercase font-bold">Attached File</p>
                <p className="text-sm font-medium text-blue-600">{file ? file.name : 'No file attached'}</p>
              </div>
              <div className="p-3 bg-amber-50 rounded-xl border border-amber-100 flex gap-3">
                <AlertCircle className="text-amber-500 shrink-0" size={18} />
                <p className="text-[11px] text-amber-700 leading-relaxed">
                  By clicking "Confirm Submission", you agree that all information provided is accurate and truthful.
                </p>
              </div>
            </div>

            <div className="p-6 bg-slate-50 border-t flex gap-3">
              <button 
                onClick={() => setShowConfirm(false)}
                className="flex-1 py-3 text-sm font-bold text-slate-600 hover:bg-slate-200 rounded-xl transition-colors"
              >
                Go Back
              </button>
              <button 
                onClick={handleFinalSubmit}
                disabled={loading}
                className="flex-1 py-3 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-all shadow-lg shadow-blue-100"
              >
                {loading ? "Processing..." : "Confirm Submission"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}