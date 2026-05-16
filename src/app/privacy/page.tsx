export default function PrivacyPage() {
  return (
    <div className="min-h-screen pt-20 bg-white">
      <div className="gradient-bg py-14">
        <div className="max-w-3xl mx-auto px-4 text-center text-white">
          <h1 className="text-4xl font-bold">Privacy Policy</h1>
          <p className="text-white/70 mt-2">Last updated: May 19, 2025</p>
        </div>
      </div>
      <div className="max-w-3xl mx-auto px-4 py-14 prose prose-gray max-w-none">
        {[
          { title: "1. Information We Collect", body: "We collect information you provide during signup (name, email, phone), usage data (sessions booked, pages visited), and payment information processed securely via Razorpay/Stripe. We never store full card details." },
          { title: "2. How We Use Your Information", body: "We use your information to: match you with suitable tutors, process bookings and payments, send session reminders and notifications, improve our platform, and comply with legal obligations." },
          { title: "3. Data Sharing", body: "We share your information only with: tutors you book sessions with (limited profile data), payment processors (encrypted), and service providers (Zoom, Resend). We never sell your data to third parties." },
          { title: "4. Data Security", body: "All data is encrypted in transit (TLS 1.3) and at rest (AES-256). We conduct regular security audits. Passwords are hashed using bcrypt. We comply with GDPR for EU users and applicable data protection laws." },
          { title: "5. Your Rights", body: "You have the right to: access your data, correct inaccuracies, delete your account, export your data, and opt out of marketing. Contact us at privacy@zippymindsacademy.com to exercise these rights." },
          { title: "6. Cookies", body: "We use essential cookies for authentication, analytics cookies (Google Analytics), and preference cookies. You can manage cookie preferences in your browser settings." },
          { title: "7. Children's Privacy", body: "Our platform serves students under 18 with parental consent. We take extra care to protect children's data and comply with COPPA and GDPR requirements for minors." },
          { title: "8. Contact", body: "For privacy concerns, contact our Data Protection Officer at privacy@zippymindsacademy.com or by post to our registered office in New Delhi, India." },
        ].map(({ title, body }) => (
          <section key={title} className="mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-3">{title}</h2>
            <p className="text-gray-500 leading-relaxed">{body}</p>
          </section>
        ))}
      </div>
    </div>
  );
}
