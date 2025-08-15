"use client";

export default function CopyrightFooter() {
  const currentYear = new Date().getFullYear();

  return (
    <div className="fixed bottom-6 right-4 z-10 mr-5">
      <div className="text-xs text-gray-500">
        <div className="flex flex-col space-y-1">
          <div className="flex space-x-2">
            <a href="/privacy-policy" className="hover:text-gray-300 transition-colors">
              Privacy Policy
            </a>
            <span>•</span>
            <a href="#" className="hover:text-gray-300 transition-colors">
              User Agreement
            </a>
            <span>•</span>
            <a href="#" className="hover:text-gray-300 transition-colors">
              Content Policy
            </a>
          </div>
          <div className="flex space-x-2">
            <a href="#" className="hover:text-gray-300 transition-colors">
              Moderator Code
            </a>
            <span>•</span>
            <a href="#" className="hover:text-gray-300 transition-colors">
              Help
            </a>
            <span>•</span>
            <a href="#" className="hover:text-gray-300 transition-colors">
              Careers
            </a>
          </div>
          <div className="text-center pt-1 mr-14">
            © {currentYear} ExamConnect. All rights reserved.
          </div>
        </div>
      </div>
    </div>
  );
}
