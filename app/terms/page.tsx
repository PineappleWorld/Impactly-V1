import Link from 'next/link';
import { Sparkles, ArrowLeft } from 'lucide-react';

export default function TermsPage() {
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

        <h1 className="text-5xl font-bold text-slate-900 mb-4 tracking-tight">Terms of Service</h1>
        <p className="text-slate-600 font-light mb-12">Last updated: October 2025</p>

        <div className="prose prose-slate max-w-none space-y-8">
          <section>
            <h2 className="text-3xl font-bold text-slate-900 mb-4">1. Agreement to Terms</h2>
            <p className="text-slate-600 font-light leading-relaxed">
              By accessing or using Impactly's services ("Service"), you agree to be bound by these Terms of Service ("Terms"). If you disagree with any part of these terms, you may not access the Service.
            </p>
          </section>

          <section>
            <h2 className="text-3xl font-bold text-slate-900 mb-4">2. Use of Service</h2>
            <p className="text-slate-600 font-light leading-relaxed mb-4">
              Impactly provides a platform for purchasing digital gift cards. By using our Service, you agree to:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-slate-600 font-light">
              <li>Provide accurate and complete registration information</li>
              <li>Maintain the security of your account credentials</li>
              <li>Use the Service only for lawful purposes</li>
              <li>Not engage in any fraudulent or illegal activities</li>
            </ul>
          </section>

          <section>
            <h2 className="text-3xl font-bold text-slate-900 mb-4">3. Gift Card Purchases</h2>
            <p className="text-slate-600 font-light leading-relaxed mb-4">
              All gift card sales are final. By purchasing gift cards through Impactly:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-slate-600 font-light">
              <li>You acknowledge that gift cards are provided by third-party suppliers</li>
              <li>Gift cards are subject to the terms and conditions of the issuing brand</li>
              <li>Impactly acts as a reseller and is not the issuer of gift cards</li>
              <li>Gift cards are non-refundable except as required by law</li>
              <li>Lost or stolen gift cards cannot be replaced</li>
            </ul>
          </section>

          <section>
            <h2 className="text-3xl font-bold text-slate-900 mb-4">4. Limitation of Liability</h2>
            <p className="text-slate-600 font-light leading-relaxed mb-4">
              TO THE MAXIMUM EXTENT PERMITTED BY LAW, IMPACTLY SHALL NOT BE LIABLE FOR:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-slate-600 font-light">
              <li>Any indirect, incidental, special, consequential, or punitive damages</li>
              <li>Loss of profits, revenue, data, or use</li>
              <li>Issues with gift cards issued by third-party brands</li>
              <li>Service interruptions or technical issues</li>
              <li>Actions or inactions of third-party service providers</li>
              <li>Unauthorized access to or use of our servers</li>
            </ul>
          </section>

          <section>
            <h2 className="text-3xl font-bold text-slate-900 mb-4">5. Disclaimer of Warranties</h2>
            <p className="text-slate-600 font-light leading-relaxed">
              THE SERVICE IS PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES OF ANY KIND, EITHER EXPRESS OR IMPLIED. IMPACTLY DISCLAIMS ALL WARRANTIES, INCLUDING BUT NOT LIMITED TO MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, AND NON-INFRINGEMENT. WE DO NOT WARRANT THAT THE SERVICE WILL BE UNINTERRUPTED, SECURE, OR ERROR-FREE.
            </p>
          </section>

          <section>
            <h2 className="text-3xl font-bold text-slate-900 mb-4">6. Third-Party Services</h2>
            <p className="text-slate-600 font-light leading-relaxed">
              Our Service relies on third-party service providers for gift card fulfillment and charitable donations. Impactly is not responsible for the performance, availability, or actions of these third parties. All gift cards are subject to the terms and conditions of their respective issuers.
            </p>
          </section>

          <section>
            <h2 className="text-3xl font-bold text-slate-900 mb-4">7. Impact Tickets and Donations</h2>
            <p className="text-slate-600 font-light leading-relaxed">
              Impact Tickets earned through purchases have no monetary value and cannot be redeemed for cash. They represent voting power for directing charitable contributions. Impactly reserves the right to modify or discontinue the Impact Tickets program at any time. All charitable donations are made at Impactly's discretion based on user voting.
            </p>
          </section>

          <section>
            <h2 className="text-3xl font-bold text-slate-900 mb-4">8. Account Suspension</h2>
            <p className="text-slate-600 font-light leading-relaxed">
              We reserve the right to suspend or terminate your account if we believe it has been used for illegal, fraudulent, or criminal purposes, or if you violate these Terms.
            </p>
          </section>

          <section>
            <h2 className="text-3xl font-bold text-slate-900 mb-4">9. Indemnification</h2>
            <p className="text-slate-600 font-light leading-relaxed">
              You agree to indemnify, defend, and hold harmless Impactly, its officers, directors, employees, and agents from any claims, liabilities, damages, losses, and expenses, including reasonable attorney's fees, arising out of or in any way connected with your access to or use of the Service, your violation of these Terms, or your violation of any rights of another party.
            </p>
          </section>

          <section>
            <h2 className="text-3xl font-bold text-slate-900 mb-4">10. Governing Law</h2>
            <p className="text-slate-600 font-light leading-relaxed">
              These Terms shall be governed by and construed in accordance with the laws of the jurisdiction in which Impactly operates, without regard to its conflict of law provisions.
            </p>
          </section>

          <section>
            <h2 className="text-3xl font-bold text-slate-900 mb-4">11. Changes to Terms</h2>
            <p className="text-slate-600 font-light leading-relaxed">
              We reserve the right to modify or replace these Terms at any time. If a revision is material, we will provide at least 30 days' notice prior to any new terms taking effect. Continued use of the Service after changes become effective constitutes acceptance of the revised Terms.
            </p>
          </section>

          <section>
            <h2 className="text-3xl font-bold text-slate-900 mb-4">12. Contact Us</h2>
            <p className="text-slate-600 font-light leading-relaxed">
              If you have any questions about these Terms, please contact us at legal@impactly.com.
            </p>
          </section>
        </div>
      </main>
    </div>
  );
}
