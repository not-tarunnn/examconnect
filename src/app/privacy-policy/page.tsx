import HeaderX from "@/components/HeaderX";
import FooterX from "@/components/FooterX";

export default function PrivacyPolicyPage() {
  const sections = [
    {
      title: "1. Please read carefully",
      content:
        "We care deeply about the privacy of our users. This Privacy Policy explains how we collect, use, and protect your Personal Information."
    },
    {
      title: "2. What information we collect",
      content:
        "We collect Personal Information you provide to us such as name, email address, and other contact data."
    },
    {
      title: "3. How we collect information",
      content:
        "We collect information through forms, account registration, cookies, and usage tracking tools."
    },
    {
      title: "4. How we use your information",
      content:
        "To provide and improve our services, personalize your experience, and communicate important updates."
    },
    {
      title: "5. Sharing of information",
      content:
        "We may share information with trusted third-party services to help operate and improve our business."
    },
    {
      title: "6. Use of cookies",
      content:
        "Cookies are used to personalize your experience, analyze site traffic, and serve targeted advertisements."
    },
    {
      title: "7. Data retention",
      content:
        "We retain your data only for as long as necessary to provide our services or comply with legal obligations."
    },
    {
      title: "8. Your data rights",
      content:
        "You can request access, updates, or deletion of your data by contacting us."
    },
    {
      title: "9. Third-party links",
      content:
        "Our site may include links to third-party websites with their own privacy practices."
    },
    {
      title: "10. Security measures",
      content:
        "We implement appropriate technical and organizational measures to protect your data."
    },
    {
      title: "11. Children’s privacy",
      content:
        "Our services are not directed to individuals under the age of 13."
    },
    {
      title: "12. International users",
      content:
        "If you are accessing our services from outside your country, your data may be transferred and stored internationally."
    },
    {
      title: "13. Policy changes",
      content:
        "We may update this policy from time to time. Continued use of our site indicates acceptance."
    },
    {
      title: "14. Contact us",
      content:
        "If you have any questions about this Privacy Policy, please contact us via email."
    },
    {
      title: "15. Consent",
      content:
        "By using our site, you consent to our Privacy Policy."
    },
    {
      title: "16. Compliance",
      content:
        "We comply with applicable laws including GDPR and CCPA."
    },
    {
      title: "17. Your California rights",
      content:
        "California residents may request certain disclosures regarding our data sharing practices."
    },
    {
      title: "18. Effective date",
      content:
        "This Privacy Policy is effective from March 3, 2024."
    }
  ];

  return (
    <div className="min-h-screen bg-white text-black">
      <HeaderX />
      <main className="max-w-5xl mx-auto px-6 py-20">
        <h1 className="text-4xl font-bold mb-4">Privacy Policy</h1>
        <p className="text-sm mb-10 text-gray-600">Effective from: August 1, 2025</p>

        {sections.map((section, index) => (
          <div key={index} className="mb-12">
            <h2 className="text-xl font-semibold mb-4">{section.title}</h2>
            <p className="text-gray-700 leading-relaxed">{section.content}</p>
            <hr className="mt-6 border-gray-300" />
          </div>
        ))}
      </main>
      <FooterX />
    </div>
  );
}
