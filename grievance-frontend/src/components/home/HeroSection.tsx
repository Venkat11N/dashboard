import {FileText, ChevronRight, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { getGreeting } from "../utils/grievanceHelpers";
import { Grievance } from '../grievance/GrievanceService';



interface HeroSectionProps {
  userName: string;
}

export default function HeroSection ({ userName } HeroSectionProps){
  const navigate = useNavigate();
  const firstName = userName?.split(" ")[0] || "User";

  return (
    <div className="relative overflow-hidden bg-gradient-to-r from-indigo-600 to-purple-600 rounded-3xl p-8 md:p-12 text-white shadow-2xl">
      <div className="relative z-10">
        <div className="flex items-center gap-2 mb-4">
          <Sparkles className="w-5 h-5"/>
          <span className="text-sm font-semibold opacity-90">Maritime Governance</span>
        </div>

        <h1 className="text-3xl md:test-5xl font-bold mb-3">
          Good {getGreeting()}, {firstName}!
        </h1>
        <p className="text-lg opacity-90 mb-8 max-w-2xl">
          Your centralized hub for maritime grievance management and resolution tracking.
        </p>

        <button
          onClick={() => navigate('/dashboard/grievacnes/new')}
          className="bg-white text-indigo-600  px-6 py-3 rounded-sl font-semibold hover:-translate-y-1 transition-all duration-200 inline-flex items-center gap-2"
        >
          <FileText className="w-5 h-5"/>
          Submit New Grievance
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      <div className="absolute top-0 right-0 -mt-12 -mr-12 w-64 h-64 bg-white/10 rounded-full blur-3xl"/>
      <div className="absolute bottom-0 left-1/2 -mb-16 w-96 h-96 bg-purple-400/20 rounded-full blur-3xl"/>
    </div>
  )
}