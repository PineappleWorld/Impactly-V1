import Link from 'next/link';
import { Sparkles, ArrowLeft } from 'lucide-react';

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-rose-50/30 to-amber-50/40">
      <header className="sticky top-0 z-50 backdrop-blur-md bg-white/80 border-b border-slate-200/50">
        <div className="max-w-7xl mx-auto px-8 py-5 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <Sparkles className="w-7 h-7 text-emerald-600" />
            <span className="text-2xl font-bold text-slate-900 tracking-tight">Impactly</span>
          </Link>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-8 py-16">
        <Link href="/" className="inline-flex items-center gap-2 text-slate-700 hover:text-slate-900 mb-8 transition-colors">
          <ArrowLeft className="w-5 h-5" />
          Back to Home
        </Link>

        <h1 className="text-5xl font-bold text-slate-900 mb-4 tracking-tight">Privacy Policy</h1>
        <p className="text-slate-600 font-light mb-12">Last updated: October 2025</p>

        <div className="prose prose-slate max-w-none space-y-8">
          <section>
            <h2 className="text-3xl font-bold text-slate-900 mb-4">1. Information We Collect</h2>
            <p className="text-slate-600 font-light leading-relaxed mb-4">
              We collect information that you provide directly to us, including:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-slate-600 font-light">
              <li>Account information (name, email address, password)</li>
              <li>Payment information (processed securely through third-party payment processors)</li>
              <li>Transaction history and gift card purchases</li>
              <li>Impact Tickets balance and voting preferences</li>
              <li>Communication preferences</li>
            </ul>
          </section>

          <section>
            <h2 className="text-3xl font-bold text-slate-900 mb-4">2. How We Use Your Information</h2>
            <p className="text-slate-600 font-light leading-relaxed mb-4">
              We use the information we collect to:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-slate-600 font-light">
              <li>Process your gift card purchases</li>
              <li>Manage your account and Impact Tickets</li>
              <li>Send transactional emails and notifications</li>
              <li>Direct charitable contributions based on user voting</li>
              <li>Improve our services and user experience</li>
              <li>Comply with legal obligations</li>
            </ul>
          </section>

          <section>
            <h2 className="text-3xl font-bold text-slate-900 mb-4">3. Information Sharing</h2>
            <p className="text-slate-600 font-light leading-relaxed mb-4">
              We do not sell your personal information. We may share your information with:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-slate-600 font-light">
              <li>Third-party service providers who assist in operating our platform</li>
              <li>Payment processors for transaction processing</li>
              <li>Law enforcement when required by law</li>
            </ul>
          </section>

          <section>
            <h2 className="text-3xl font-bold text-slate-900 mb-4">4. Data Security</h2>
            <p className="text-slate-600 font-light leading-relaxed">
              We implement appropriate technical and organizational measures to protect your personal information. However, no method of transmission over the Internet is 100% secure, and we cannot guarantee absolute security.
            </p>
          </section>

          <section>
            <h2 className="text-3xl font-bold text-slate-900 mb-4">5. Your Rights</h2>
            <p className="text-slate-600 font-light leading-relaxed mb-4">
              You have the right to:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-slate-600 font-light">
              <li>Access your personal information</li>
              <li>Correct inaccurate data</li>
              <li>Request deletion of your data</li>
              <li>Opt-out of marketing communications</li>
              <li>Export your data</li>
            </ul>
          </section>

          <section>
            <h2 className="text-3xl font-bold text-slate-900 mb-4">6. Cookies and Tracking</h2>
            <p className="text-slate-600 font-light leading-relaxed">
              We use cookies and similar tracking technologies to track activity on our Service and hold certain information. You can instruct your browser to refuse all cookies or to indicate when a cookie is being sent.
            </p>
          </section>

          <section>
            <h2 className="text-3xl font-bold text-slate-900 mb-4">7. Children's Privacy</h2>
            <p className="text-slate-600 font-light leading-relaxed">
              Our Service is not intended for children under 13 years of age. We do not knowingly collect personal information from children under 13.
            </p>
          </section>

          <section>
            <h2 className="text-3xl font-bold text-slate-900 mb-4">8. Changes to Privacy Policy</h2>
            <p className="text-slate-600 font-light leading-relaxed">
              We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last updated" date.
            </p>
          </section>

          <section>
            <h2 className="text-3xl font-bold text-slate-900 mb-4">9. Contact Us</h2>
            <p className="text-slate-600 font-light leading-relaxed">
              If you have questions about this Privacy Policy, please contact us at privacy@impactly.com.
            </p>
          </section>
        </div>
      </main>
    </div>
  );
}
