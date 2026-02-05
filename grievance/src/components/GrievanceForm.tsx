import { useState, useEffect, useRef } from "react";
import { supabase } from "../../src/lib/supabase";
import { useNavigate } from "react-router-dom";
import { Upload, ShieldCheck, X, Search, FileText, Trash2 } from "lucide-react";
import { getAllCategories, getSubcategories } from "../services/CategoryService";

export default function GrievanceForm() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState<any>(null);
  const [categories, setCategories] = useState<any[]>([]);
  const [subcategories, setSubcategories] = useState<any[]>([]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [showConfirm, setShowConfirm] = useState(false);
  
  const [formData, setFormData] = useState({
    description: "",
    subCategoryId: "",
  });

  const [files, setFiles] = useState<File[]>([]);


  useEffect(() => {
    async function prepareForm() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;


      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
      
      if (profileData) setProfile(profileData);


      const cats = await getAllCategories();
      setCategories(cats);
    }
    prepareForm();
  }, []);


  useEffect(() => {
    async function fetchSubs() {
      if (selectedCategory) {
        setFormData(prev => ({ ...prev, subCategoryId: "" }));
        const subs = await getSubcategories(Number(selectedCategory));
        setSubcategories(subs);
      } else {
        setSubcategories([]);
      }
    }
    fetchSubs();
  }, [selectedCategory]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      setFiles(prev => [...prev, ...newFiles]);
    }
  };

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleFinalSubmit = async () => {
    if (!profile) return alert("Profile not loaded.");
    setLoading(true);
    setShowConfirm(false);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Session expired. Please log in.");

      const refNo = `GRV-${Date.now().toString().slice(-6)}`;


      const { data: grievance, error: gError } = await supabase
        .from('grievances')
        .insert({
          reference_number: refNo,
          user_id: session.user.id,
          indos_number: profile.indos_number,
          first_name: profile.first_name,
          last_name: profile.last_name,
          category_id: Number(selectedCategory),
          subcategory_id: Number(formData.subCategoryId),
          description: formData.description,
          status: 'SUBMITTED'
        })
        .select().single();

      if (gError) throw gError;


      if (files.length > 0 && grievance) {
        for (const file of files) {
          const fileExt = file.name.split('.').pop();
          const fileName = `${grievance.id}/${Math.random().toString(36).substring(7)}.${fileExt}`;
          
          const { error: uploadError } = await supabase.storage
            .from('grievance-attachments')
            .upload(fileName, file);

          if (!uploadError) {
            const { data: { publicUrl } } = supabase.storage
              .from('grievance-attachments')
              .getPublicUrl(fileName);

            await supabase.from('grievance_files').insert({
              grievance_id: grievance.id,
              file_url: publicUrl
            });
          }
        }
      }

      navigate("/dashboard/application-status", { state: { 
        refNumber: refNo,
        categoryName: categories.find(c => c.id == selectedCategory)?.name
      } });
    } catch (err: any) {
      alert("Submission Error: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-3xl shadow-sm border border-gray-100 relative">
      <h1 className="text-2xl font-black mb-6 text-gray-900 tracking-tight">Submit New Grievance</h1>

      <form onSubmit={(e) => { e.preventDefault(); setShowConfirm(true); }} className="space-y-6">
        
        {/* Profile Card */}
        <div className="bg-slate-50 p-6 rounded-3xl border border-slate-200 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="space-y-1">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">INDoS Number</label>
            <p className="font-mono font-bold text-blue-600 text-lg">{profile?.indos_number || '---'}</p>
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">CDC Number</label>
            <p className="font-mono font-bold text-blue-600 text-lg">{profile?.cdc_number || '---'}</p>
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Full Name</label>
            <p className="font-bold text-slate-800 truncate">{profile ? `${profile.first_name} ${profile.last_name}` : '---'}</p>
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Email</label>
            <p className="font-bold text-slate-800 truncate">{profile?.email || '---'}</p>
          </div>
        </div>


        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="flex flex-col gap-2">
            <label className="text-xs font-bold text-gray-700 uppercase px-1">Category</label>
            <select
              className="border-none ring-1 ring-slate-200 p-4 rounded-2xl bg-white outline-none focus:ring-2 focus:ring-blue-500 font-medium"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              required
            >
              <option value="">Select Category</option>
              {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-xs font-bold text-gray-700 uppercase px-1">Sub-Category</label>
            <select
              className="border-none ring-1 ring-slate-200 p-4 rounded-2xl bg-white outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-slate-100 font-medium"
              disabled={!selectedCategory}
              value={formData.subCategoryId}
              onChange={(e) => setFormData({ ...formData, subCategoryId: e.target.value })}
              required
            >
              <option value="">Select Sub-category</option>
              {subcategories.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </div>
        </div>


        <div className="flex flex-col gap-2">
          <label className="text-xs font-bold text-gray-700 uppercase px-1">Detailed Description</label>
          <textarea
            rows={5}
            className="border-none ring-1 ring-slate-200 p-4 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 resize-none font-medium"
            placeholder="Provide details about your issue..."
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            required
          />
        </div>


        <div className="space-y-3">
          <label className="text-xs font-bold text-gray-700 uppercase px-1">Attachments</label>
          <div className="border-2 border-dashed border-slate-200 p-8 rounded-3xl flex flex-col items-center gap-3 hover:bg-slate-50 hover:border-blue-400 transition-all cursor-pointer relative group">
            <div className="p-3 bg-white rounded-xl shadow-sm group-hover:bg-blue-600 group-hover:text-white transition-all">
              <Upload size={20} />
            </div>
            <p className="text-sm text-slate-500 font-bold text-center">Click to upload multiple documents</p>
            <input type="file" multiple className="absolute inset-0 opacity-0 cursor-pointer" onChange={handleFileChange} />
          </div>

          <div className="flex flex-col gap-2">
            {files.map((f, index) => (
              <div key={index} className="flex items-center justify-between bg-blue-50/50 p-3 rounded-xl border border-blue-100">
                <div className="flex items-center gap-3 truncate">
                  <FileText size={18} className="text-blue-500" />
                  <span className="text-sm font-medium text-slate-700 truncate">{f.name}</span>
                </div>
                <button type="button" onClick={() => removeFile(index)} className="p-1 hover:bg-red-100 rounded-lg text-red-500 transition-colors">
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>
        </div>

        <button type="submit" disabled={!profile} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black uppercase tracking-widest py-5 rounded-2xl transition-all shadow-xl disabled:bg-slate-300 disabled:cursor-not-allowed">
          {!profile ? "Loading Profile..." : "Proceed to Confirmation"}
        </button>
      </form>


      {showConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl p-8 animate-in zoom-in-95">
            <div className="flex items-center gap-3 text-blue-600 mb-6">
              <ShieldCheck size={28} />
              <h3 className="text-2xl font-black tracking-tight">Confirm Submission</h3>
            </div>
            <div className="space-y-4 mb-8">
              <div className="flex justify-between border-b pb-2">
                <span className="text-[10px] font-bold text-slate-400 uppercase">Files</span>
                <span className="text-sm font-bold">{files.length} Attachments</span>
              </div>
              <div className="flex justify-between border-b pb-2">
                <span className="text-[10px] font-bold text-slate-400 uppercase">Category</span>
                <span className="text-sm font-bold">{categories.find(c => c.id == selectedCategory)?.name}</span>
              </div>
            </div>
            <div className="flex gap-4">
              <button onClick={() => setShowConfirm(false)} className="flex-1 bg-slate-100 py-4 rounded-2xl font-bold text-slate-600">Back</button>
              <button onClick={handleFinalSubmit} disabled={loading} className="flex-1 bg-blue-600 text-white py-4 rounded-2xl font-bold">
                {loading ? "Submitting..." : "Confirm & Submit"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}