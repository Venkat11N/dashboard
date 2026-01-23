import Navbar from "./Navbar";
import Sidebar from "./Sidebar";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Navbar />
        
        {/* Main Content Area */}
        <main className="p-8 flex-1">
          {children}
        </main>

        {/* Professional Footer */}
        <footer className="bg-white border-t border-gray-100 p-10 mt-auto">
          <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-12">
            
          {/* Left Side: Map & Location */}
          <div className="space-y-4">
            <h3 className="font-bold text-gray-900 uppercase tracking-widest text-xs">Headquarters</h3>
            <div className="w-full h-40 bg-gray-100 rounded-2xl overflow-hidden border border-gray-200 relative group">
              {/* Verified DG Shipping Google Maps Link */}
              <iframe 
                className="w-full h-full grayscale hover:grayscale-0 transition-all"
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3769.7431206124574!2d72.92728127520641!3d19.1298255820835!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3be7dd8ff9e7e21b%3A0xa4c71af02ae2dff9!2sDirectorate%20General%20of%20Shipping!5e0!3m2!1sen!2sin!4v1700000000000!5m2!1sen!2sin"
                allowFullScreen={false}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              ></iframe>
            </div>
            <p className="text-sm text-gray-500 leading-relaxed">
              <strong>Directorate General of Shipping</strong><br />
              9th Floor, Beta Building, i-Think Techno Campus,<br />
              Kanjurmarg (East), Mumbai - 400042
            </p>
          </div>

            {/* Middle: Quick Links */}
            <div className="flex flex-col gap-3">
              <h3 className="font-bold text-gray-900 uppercase tracking-widest text-xs">Quick Links</h3>
              <ul className="text-sm text-gray-500 space-y-2">
                <li><a href="#" className="hover:text-blue-600 transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-blue-600 transition-colors">Terms of Service</a></li>
                <li><a href="#" className="hover:text-blue-600 transition-colors">Contact Support</a></li>
              </ul>
            </div>

            {/* Right: Copyright */}
            <div className="flex flex-col justify-between items-end">
              <div className="text-right">
                <p className="font-bold text-blue-600">Grievance Redressal System</p>
                <p className="text-sm text-gray-400 mt-1">Version 2.0.4</p>
              </div>
              <p className="text-xs text-gray-400">
                &copy; {new Date().getFullYear()} All Rights Reserved.
              </p>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}