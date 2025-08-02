// components/FooterX.tsx
'use client';

import {
  FaFacebookF,
  FaYoutube,
  FaInstagram,
  FaTiktok,
  FaPinterestP,
  FaXTwitter,
  FaLinkedinIn,
} from "react-icons/fa6";

export default function FooterX() {
  return (
    <footer className="border-t bg-white py-6 px-4 text-sm text-gray-600">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Social Icons */}
        <div className="flex space-x-4 text-black text-xl">
          <a href="#" className="hover:scale-110 transition"><FaFacebookF /></a>
          <a href="#" className="hover:scale-110 transition"><FaYoutube /></a>
          <a href="#" className="hover:scale-110 transition"><FaInstagram /></a>
          <a href="#" className="hover:scale-110 transition"><FaTiktok /></a>
          <a href="#" className="hover:scale-110 transition"><FaPinterestP /></a>
          <a href="#" className="hover:scale-110 transition"><FaXTwitter /></a>
          <a href="#" className="hover:scale-110 transition"><FaLinkedinIn /></a>
        </div>

        {/* Links and Copyright */}
        <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-gray-700">
          <a href="#" className="hover:underline">Terms of Use</a>
          <a href="#" className="hover:underline">Privacy Policy</a>
          <span className="text-gray-500">© 2006–2025 YourCompany, Inc</span>
        </div>
      </div>
    </footer>
  );
}
