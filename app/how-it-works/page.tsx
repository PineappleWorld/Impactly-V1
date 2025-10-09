'use client';

import { SharedHeader } from '@/components/shared-header';
import { SharedFooter } from '@/components/shared-footer';
import { ShoppingCart, Heart, Coins, TrendingUp } from 'lucide-react';

export default function HowItWorksPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-rose-50/30 to-amber-50/40">
      <SharedHeader />

      <main className="max-w-5xl mx-auto px-6 py-16">
        <div className="text-center mb-16">
          <h1 className="text-6xl md:text-7xl font-bold text-slate-900 mb-6 tracking-tight">
            How It Works
          </h1>
          <p className="text-2xl text-slate-600 max-w-3xl mx-auto leading-relaxed">
            Making an impact is simple. Shop, earn, and support causes you care about.
          </p>
        </div>

        <div className="space-y-12">
          <div className="flex items-start gap-8 bg-white/90 backdrop-blur p-10 rounded-2xl border border-slate-200 shadow-sm">
            <div className="flex-shrink-0">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center">
                <ShoppingCart className="w-10 h-10 text-white" />
              </div>
            </div>
            <div>
              <div className="inline-block px-4 py-1 bg-emerald-100 text-emerald-700 rounded-full font-bold text-lg mb-4">
                STEP 1
              </div>
              <h2 className="text-3xl font-bold text-slate-900 mb-4">Choose Your Gift Card</h2>
              <p className="text-xl text-slate-700 leading-relaxed">
                Browse hundreds of gift cards from top brands like Amazon, Starbucks, and more.
                Same prices as everywhere else, but with a purpose behind every purchase.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-8 bg-white/90 backdrop-blur p-10 rounded-2xl border border-slate-200 shadow-sm">
            <div className="flex-shrink-0">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
                <Heart className="w-10 h-10 text-white" />
              </div>
            </div>
            <div>
              <div className="inline-block px-4 py-1 bg-blue-100 text-blue-700 rounded-full font-bold text-lg mb-4">
                STEP 2
              </div>
              <h2 className="text-3xl font-bold text-slate-900 mb-4">Automatic Impact Split</h2>
              <p className="text-xl text-slate-700 leading-relaxed">
                <strong>50% of the profit</strong> Impactly earns from your purchase automatically goes to
                verified nonprofits you've selected. The other 50% helps us keep the platform running and grow
                our impact.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-8 bg-white/90 backdrop-blur p-10 rounded-2xl border border-slate-200 shadow-sm">
            <div className="flex-shrink-0">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center">
                <Coins className="w-10 h-10 text-white" />
              </div>
            </div>
            <div>
              <div className="inline-block px-4 py-1 bg-amber-100 text-amber-700 rounded-full font-bold text-lg mb-4">
                STEP 3
              </div>
              <h2 className="text-3xl font-bold text-slate-900 mb-4">Earn Impact Credits (PACT)</h2>
              <p className="text-xl text-slate-700 leading-relaxed">
                Every purchase earns you <strong>PACT credits</strong> (100 PACT = $1 spent). These credits
                accumulate in your wallet and will be redeemable for crypto tokens in the future, giving you
                both social and financial returns.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-8 bg-white/90 backdrop-blur p-10 rounded-2xl border border-slate-200 shadow-sm">
            <div className="flex-shrink-0">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-rose-500 to-pink-500 flex items-center justify-center">
                <TrendingUp className="w-10 h-10 text-white" />
              </div>
            </div>
            <div>
              <div className="inline-block px-4 py-1 bg-rose-100 text-rose-700 rounded-full font-bold text-lg mb-4">
                STEP 4
              </div>
              <h2 className="text-3xl font-bold text-slate-900 mb-4">Track Your Impact</h2>
              <p className="text-xl text-slate-700 leading-relaxed">
                View your personalized Impact Dashboard to see your purchase history, total contributions to
                your selected charities, PACT credits balance, and the real-world change you're creating.
              </p>
            </div>
          </div>
        </div>

        <div className="mt-16 p-12 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-3xl border-2 border-emerald-200 text-center">
          <h2 className="text-4xl font-bold text-slate-900 mb-6">Ready to Make an Impact?</h2>
          <p className="text-2xl text-slate-700 mb-8">
            Every purchase matters. Start shopping with purpose today.
          </p>
          <a
            href="/marketplace"
            className="inline-block px-12 py-5 bg-slate-900 hover:bg-slate-800 text-white text-xl font-bold rounded-full transition-colors shadow-lg"
          >
            Start Shopping
          </a>
        </div>
      </main>

      <SharedFooter />
    </div>
  );
}
