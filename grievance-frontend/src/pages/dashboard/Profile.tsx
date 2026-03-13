

import { useState, useEffect } from "react";
import DashboardLayout from "../../components/layout/DashboardLayout";
import { 
  User, Mail, Phone, Hash, CreditCard, ShieldCheck, Loader2
} from "lucide-react";
import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_URL;

export default function Profile() {
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<any>(null);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem('token') || localStorage.getItem('accessToken');
      if (!token) return;

      const response = await axios.get(`${API_BASE_URL}/profile`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.data.status === 'ok') {
        setProfile(response.data.user);
      }
    } catch (error) {
      console.error('Failed to fetch profile:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="min-h-screen flex items-center justify-center bg-slate-50">
          <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-slate-900">My Profile</h1>
            <p className="text-slate-500">Personal information and account details</p>
          </div>

          {/* Profile Card */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            
            {/* Banner & Avatar */}
            <div className="h-32 bg-slate-800 relative">
              <div className="absolute -bottom-12 left-8">
                <div className="w-24 h-24 bg-white rounded-full p-1 shadow-lg">
                  <div className="w-full h-full bg-slate-100 rounded-full flex items-center justify-center text-slate-400">
                    <User size={40} />
                  </div>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="pt-16 pb-8 px-8">
              
              {/* Name & Role */}
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-slate-900">{profile?.full_name}</h2>
                <div className="flex items-center gap-2 mt-1">
                  <span className="px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 text-xs font-semibold border border-blue-100">
                    {profile?.role_label || profile?.role || 'User'}
                  </span>
                  <span className="text-slate-400 text-sm">•</span>
                  <span className="text-slate-500 text-sm">Active Account</span>
                </div>
              </div>

              {/* Details Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                
                {/* Email */}
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                    Email Address <ShieldCheck size={12} className="text-slate-400" />
                  </label>
                  <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg border border-slate-100">
                    <Mail size={18} className="text-slate-400" />
                    <span className="text-slate-800 font-medium">{profile?.email}</span>
                  </div>
                </div>

                {/* Phone */}
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Phone Number</label>
                  <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg border border-slate-100">
                    <Phone size={18} className="text-slate-400" />
                    <span className="text-slate-800 font-medium">{profile?.phone || 'Not provided'}</span>
                  </div>
                </div>

                {/* INDOS (Read Only) */}
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                    INDoS Number <ShieldCheck size={12} className="text-green-600" />
                  </label>
                  <div className="flex items-center gap-3 p-3 bg-blue-50/50 rounded-lg border border-blue-100">
                    <Hash size={18} className="text-blue-400" />
                    <span className="text-slate-700 font-mono font-semibold">{profile?.indos_number}</span>
                  </div>
                </div>

                {/* CDC (Read Only) */}
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                    CDC Number <ShieldCheck size={12} className="text-green-600" />
                  </label>
                  <div className="flex items-center gap-3 p-3 bg-blue-50/50 rounded-lg border border-blue-100">
                    <CreditCard size={18} className="text-blue-400" />
                    <span className="text-slate-700 font-mono font-semibold">{profile?.cdc_number}</span>
                  </div>
                </div>

              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}