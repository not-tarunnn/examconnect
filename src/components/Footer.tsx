export default function Footer() {
  return (
    <footer className="hidden md:block fixed bottom-0 left-0 w-full z-50 text-white">
      {/* Shadow Fade Effect */}
      <div className="absolute inset-0 h-full bg-gradient-to-t from-black/60 to-transparent pointer-events-none z-0" />

      {/* Footer Content */}
      <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-4 px-0  py-4 max-w-7xl mx-auto bg-transparent ">
        <p className="text-sm translate-x-[-1.5em] text-center text-black md:text-left">
          © 2025 EXAM CONNECT | All Rights Reserved
        </p>

        <div className="flex flex-wrap justify-center gap-4 text-sm font-semibold uppercase translate-x-[1.5em]">
          <a href="/contact" className="hover:text-gray-300 transition  text-white">Get In Touch</a>
          <a href="/terms" className="hover:text-gray-300 transition text-white">Terms of Service</a>
          <a href="/privacy-policy" className="hover:text-gray-300 transition text-white">Privacy Policy</a>
          <a href="/terms-and-conditions" className="hover:text-gray-300 transition text-white">Terms & Conditions</a>
          <a href="/about" className="hover:text-gray-300 transition text-white">About Us</a>
          <a href="/privacy-policy#dont-sell" className="hover:text-gray-300 transition text-white">Do Not Sell My Personal Info</a>
        </div>
      </div>
    </footer>
  );
}
