import Link from 'next/link';
import { Sparkles, ArrowLeft, Mail, MessageSquare } from 'lucide-react';

export default function ContactPage() {
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

        <h1 className="text-5xl font-bold text-slate-900 mb-8 tracking-tight">Contact Us</h1>

        <div className="space-y-8">
          <div className="bg-white/80 backdrop-blur-sm border border-slate-200 rounded-2xl p-8">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center flex-shrink-0">
                <Mail className="w-6 h-6 text-emerald-600" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-slate-900 mb-2">Email Support</h3>
                <p className="text-slate-600 font-light mb-3">
                  For general inquiries and support questions
                </p>
                <a href="mailto:support@impactly.com" className="text-emerald-600 font-medium hover:text-emerald-700">
                  support@impactly.com
                </a>
              </div>
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-sm border border-slate-200 rounded-2xl p-8">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-cyan-100 rounded-xl flex items-center justify-center flex-shrink-0">
                <MessageSquare className="w-6 h-6 text-cyan-600" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-slate-900 mb-2">Business Inquiries</h3>
                <p className="text-slate-600 font-light mb-3">
                  For partnership and business opportunities
                </p>
                <a href="mailto:business@impactly.com" className="text-cyan-600 font-medium hover:text-cyan-700">
                  business@impactly.com
                </a>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
