import React from 'react';

export default function PersonalDetails({ formData, handleChange }: any) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-50/50 p-6 rounded-3xl border border-slate-100">
      <div className="space-y-2">
        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-1">First Name</label>
        <input name="firstName" value={formData.firstName} readOnly className="w-full p-4 rounded-2xl bg-white border-none ring-1 ring-slate-200 text-sm font-semibold text-slate-500 cursor-not-allowed" />
      </div>
      <div className="space-y-2">
        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-1">Last Name</label>
        <input name="lastName" value={formData.lastName} readOnly className="w-full p-4 rounded-2xl bg-white border-none ring-1 ring-slate-200 text-sm font-semibold text-slate-500 cursor-not-allowed" />
      </div>
      <div className="space-y-2">
        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-1">CDC Number</label>
        <input name="cdcNumber" value={formData.cdcNumber} readOnly className="w-full p-4 rounded-2xl bg-white border-none ring-1 ring-slate-200 text-sm font-semibold text-slate-500 cursor-not-allowed" />
      </div>
      <div className="space-y-2">
        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-1">Date of Birth</label>
        <input name="dob" type="date" value={formData.dob} readOnly className="w-full p-4 rounded-2xl bg-white border-none ring-1 ring-slate-200 text-sm font-semibold text-slate-500 cursor-not-allowed" />
      </div>
    </div>
  );
}