export default function TermsPage() {
  return (
    <div className="min-h-screen pt-20 bg-white">
      <div className="gradient-bg py-14">
        <div className="max-w-3xl mx-auto px-4 text-center text-white">
          <h1 className="text-4xl font-bold">Terms & Conditions</h1>
          <p className="text-white/70 mt-2">Last updated: May 19, 2025</p>
        </div>
      </div>
      <div className="max-w-3xl mx-auto px-4 py-14">
        {[
          { title: "1. Acceptance of Terms", body: "By using Zippy Minds Academy, you agree to these terms. If you do not agree, please do not use our services. These terms apply to parents, tutors, and all platform users." },
          { title: "2. Service Description", body: "Zippy Minds Academy is an online tutoring marketplace connecting parents/students with qualified Indian tutors for 1-to-1 sessions via Zoom. We facilitate bookings, payments, and scheduling." },
          { title: "3. Account Responsibilities", body: "You are responsible for maintaining account security. You must provide accurate information. One account per person. Accounts found to be fraudulent will be permanently suspended." },
          { title: "4. Booking & Cancellation Policy", body: "Free demo sessions can be cancelled up to 24 hours before. Paid sessions cancelled with less than 24 hours notice are non-refundable. Tutor no-shows result in a full credit or refund." },
          { title: "5. Payment Terms", body: "All payments are processed securely. Prices are displayed in USD unless otherwise specified. Invoices are available in your dashboard. Disputes must be reported within 7 days." },
          { title: "6. Tutor Standards", body: "Tutors must maintain a minimum 4.5 rating. Three or more late cancellations may result in removal. Tutors must conduct sessions professionally and follow our Code of Conduct." },
          { title: "7. Intellectual Property", body: "All content on this platform — including course materials, interface design, and branding — is owned by Zippy Minds Academy. You may not reproduce or distribute our content without written permission." },
          { title: "8. Limitation of Liability", body: "Zippy Minds Academy is not liable for indirect damages arising from platform use. Our maximum liability is limited to fees paid in the 30 days preceding the claim." },
          { title: "9. Governing Law", body: "These terms are governed by Indian law. Disputes shall be resolved through binding arbitration under the Arbitration and Conciliation Act, 1996, New Delhi." },
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
