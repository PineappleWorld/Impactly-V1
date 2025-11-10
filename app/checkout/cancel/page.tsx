'use client';

import Link from 'next/link';
import { Sparkles, XCircle, ShoppingCart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

export default function CheckoutCancelPage() {
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

      <main className="max-w-3xl mx-auto px-8 py-16">
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-amber-100 rounded-full mb-6">
            <XCircle className="w-12 h-12 text-amber-600" />
          </div>
          <h1 className="text-5xl font-bold text-slate-900 mb-4 tracking-tight">
            Checkout Cancelled
          </h1>
          <p className="text-xl text-slate-600 font-light">
            Your payment was cancelled. Your cart items are still saved.
          </p>
        </div>

        <Card className="bg-white/80 backdrop-blur-sm border border-slate-200 rounded-2xl p-8 mb-8">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center shrink-0">
              <ShoppingCart className="w-6 h-6 text-slate-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-slate-900 mb-2">
                What happened?
              </h3>
              <p className="text-slate-600 leading-relaxed mb-4">
                You cancelled the payment process. Don't worry - your cart items are still saved 
                and you can complete your purchase whenever you're ready.
              </p>
              <p className="text-slate-600 leading-relaxed">
                If you encountered any issues during checkout, please contact our support team.
              </p>
            </div>
          </div>
        </Card>

        <div className="flex flex-col sm:flex-row gap-4">
          <Link href="/checkout" className="flex-1">
            <Button className="w-full h-12 rounded-xl bg-slate-900 hover:bg-slate-800 text-base font-medium">
              Try Again
            </Button>
          </Link>
          <Link href="/marketplace" className="flex-1">
            <Button variant="outline" className="w-full h-12 rounded-xl text-base font-medium">
              Continue Shopping
            </Button>
          </Link>
        </div>
      </main>
    </div>
  );
}
