import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SharedHeader } from '@/components/shared-header';
import { SharedFooter } from '@/components/shared-footer';

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-rose-50/30 to-amber-50/40">
      <SharedHeader />

      <main className="max-w-4xl mx-auto px-8 py-16">
        <Link href="/" className="inline-flex items-center gap-2 text-slate-700 hover:text-slate-900 mb-8 transition-colors">
          <ArrowLeft className="w-5 h-5" />
          Back to Home
        </Link>

        <h1 className="text-5xl font-bold text-slate-900 mb-8 tracking-tight">About Impactly</h1>

        <div className="prose prose-slate max-w-none">
          <p className="text-lg text-slate-600 font-light leading-relaxed mb-6">
            Impactly is revolutionizing how everyday purchases create social impact. We believe that every transaction should contribute to positive change in the world.
          </p>

          <h2 className="text-3xl font-bold text-slate-900 mt-12 mb-4">Our Mission</h2>
          <p className="text-slate-600 font-light leading-relaxed mb-6">
            To create a sustainable social, environmental, and financial impact economy where consumers can make a difference with their everyday purchases. We believe profit should be shared across the value chain to benefit users, partners and shareholders in a shared value economy. We are native to emerging technologies, with an aim to craft meaningful value for our community.
          </p>

          <h2 className="text-3xl font-bold text-slate-900 mt-12 mb-4">How It Works</h2>
          <p className="text-slate-600 font-light leading-relaxed mb-6">
            When you purchase gift cards through Impactly, a portion of our profits automatically goes to verified nonprofit organizations. You earn Impact Tickets with every purchase, giving you voting power to direct future donations to causes you care about.
          </p>

          <h2 className="text-3xl font-bold text-slate-900 mt-12 mb-4">Join Us</h2>
          <p className="text-slate-600 font-light leading-relaxed mb-6">
            Together, we can create meaningful change while shopping for the things we already buy. Join thousands of users who are making an impact with every purchase.
          </p>

          <Link href="/marketplace" className="inline-block mt-8">
            <Button className="rounded-full px-10 py-6 text-lg font-medium bg-slate-900 hover:bg-slate-800 text-white shadow-lg">
              Start Shopping
            </Button>
          </Link>
        </div>
      </main>
      <SharedFooter />
    </div>
  );
}
