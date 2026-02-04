import { useState, useEffect, useRef } from "react";
import { supabase } from "../../src/lib/supabase";
import { useNavigate } from "react-router-dom";
import { Upload, CheckCircle2, AlertCircle, ShieldCheck, X, Search } from "lucide-react";

// Keyword suggestions based on your Escalation Matrix categories
const MARITIME_KEYWORDS = [
  "INDoS Reference Number", "CDC Renewal Delay", "Non-payment of wages",
  "Sign off request", "Vessel abandonment", "Medical emergency",
  "SID biometric error", "Sea service update", "Passport number correction",
  "MTI course fees", "Assessment rejected", "COC dispatch status"
];

export default function GrievanceForm() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState<any>(null);
  const [categories, setCategories] = useState<any[]>([]);
  const [subcategories, setSubcategories] = useState<any[]>([]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [showConfirm, setShowConfirm] = useState(false);
  
  // States for Autocomplete
  const [subjectSuggestions, setSubjectSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const suggestionRef = useRef<HTMLDivElement>(null);

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
        .select('*, master_ranks(name), master_departments(name)')
        .eq('id', user.id)
        .single();
      
      setProfile(profileData);

      const { data: catData } = await supabase.from('grievance_categories').select('*');
      setCategories(catData || []);
    }
    prepareForm();

    // Close suggestions on click outside
    const handleClickOutside = (e: any) => {
      if (suggestionRef.current && !suggestionRef.current.contains(e.target)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // AUTO-FILTER Sub-categories when Category changes
  useEffect(() => {
    if (selectedCategory) {
      // Clear current sub-category when parent category changes
      setFormData(prev => ({ ...prev, subCategoryId: "" }));
      
      supabase.from('grievance_subcategories')
        .select('*')
        .eq('category_id', selectedCategory)
        .then(({ data }) => setSubcategories(data || []));
    } else {
      setSubcategories([]);
    }
  }, [selectedCategory]);

  // AUTOCOMPLETE Logic for Subject
  const handleSubjectChange = (val: string) => {
    setFormData({ ...formData, subject: val });
    if (val.length > 2) {
      const filtered = MARITIME_KEYWORDS.filter(k => 
        k.toLowerCase().includes(val.toLowerCase())
      );
      setSubjectSuggestions(filtered);
      setShowSuggestions(true);
    } else {
      setShowSuggestions(false);
    }
  };

  const handleAttemptSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setShowConfirm(true);
  };

  async function handleFinalSubmit() {
    setLoading(true);
    setShowConfirm(false);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      // Reference Number Generation for Audit Trail
      const refNo = `GRV-${Date.now().toString().slice(-6)}`;

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

      // ... existing file upload logic ...

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
        {/* Personal Details Row (Pre-filled) */}
        <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* ... INDoS, CDC, etc. (kept same as your code) ... */}
            <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">INDoS Number</label>
                <p className="font-mono font-bold text-blue-600 text-lg">{profile?.indos_number || 'N/A'}</p>
            </div>
            <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Full Name</label>
                <p className="font-semibold text-gray-800">{profile?.first_name} {profile?.last_name}</p>
            </div>
        </div>

        {/* Category & Sub-Category Dropdowns */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold text-gray-700">Category</label>
            <select 
              className="border p-4 rounded-2xl bg-white outline-none focus:ring-2 focus:ring-blue-500 appearance-none"
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
              className="border p-4 rounded-2xl bg-white outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50 disabled:cursor-not-allowed"
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

        {/* AUTOCOMPLETE SUBJECT FIELD */}
        <div className="flex flex-col gap-2 relative" ref={suggestionRef}>
          <label className="text-sm font-semibold text-gray-700">Subject</label>
          <div className="relative">
            <input 
              className="w-full border p-4 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g. Non-payment of wages"
              value={formData.subject}
              onChange={(e) => handleSubjectChange(e.target.value)}
              onFocus={() => formData.subject.length > 2 && setShowSuggestions(true)}
              required
            />
            <Search className="absolute right-4 top-4 text-gray-300" size={20} />
          </div>
          
          {/* Suggestion Dropdown */}
          {showSuggestions && subjectSuggestions.length > 0 && (
            <div className="absolute top-[100%] left-0 right-0 z-10 bg-white border border-slate-100 shadow-xl rounded-2xl mt-1 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
              {subjectSuggestions.map((suggestion, index) => (
                <div 
                  key={index}
                  className="p-4 hover:bg-blue-50 cursor-pointer text-sm font-medium text-slate-700 border-b last:border-0 border-slate-50 transition-colors"
                  onClick={() => {
                    setFormData({...formData, subject: suggestion});
                    setShowSuggestions(false);
                  }}
                >
                  {suggestion}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-sm font-semibold text-gray-700">Description</label>
          <textarea 
            rows={5}
            className="border p-4 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            placeholder="Please provide full details for the Nodal Officer to triage..."
            value={formData.description}
            onChange={(e) => setFormData({...formData, description: e.target.value})}
            required
          />
        </div>

        {/* ... File Uploader & Confirmation Modal (kept same as your code) ... */}
        <button
          type="submit"
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black uppercase tracking-widest py-5 rounded-2xl transition-all shadow-lg shadow-blue-100 mt-4"
        >
          Proceed to Confirmation
        </button>
      </form>

      {/* Confirmation Modal Overlay Logic ... */}
      {showConfirm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
             {/* Modal Content - same as yours but with matching styles */}
             <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden p-8">
                <h3 className="text-xl font-bold mb-4">Confirm Submission</h3>
                <p className="text-sm text-gray-500 mb-6 italic">Category: {categories.find(c => c.id == selectedCategory)?.name}</p>
                <div className="flex gap-4">
                    <button onClick={() => setShowConfirm(false)} className="flex-1 bg-gray-100 py-3 rounded-xl font-bold">Back</button>
                    <button onClick={handleFinalSubmit} className="flex-1 bg-blue-600 text-white py-3 rounded-xl font-bold">Confirm</button>
                </div>
             </div>
          </div>
      )}
    </div>
  );
}