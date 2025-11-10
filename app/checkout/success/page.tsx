'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Sparkles, CheckCircle, Loader2, Gift, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useCart } from '@/lib/cart-context';

export default function CheckoutSuccessPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { clearCart } = useCart();
  const [loading, setLoading] = useState(true);
  const sessionId = searchParams.get('session_id');

  useEffect(() => {
    if (sessionId) {
      // Clear the cart after successful payment
      clearCart();
      setLoading(false);
    } else {
      // No session ID, redirect to marketplace
      router.push('/marketplace');
    }
  }, [sessionId, clearCart, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-rose-50/30 to-amber-50/40 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-emerald-600 animate-spin" />
      </div>
    );
  }

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
          <div className="inline-flex items-center justify-center w-20 h-20 bg-emerald-100 rounded-full mb-6">
            <CheckCircle className="w-12 h-12 text-emerald-600" />
          </div>
          <h1 className="text-5xl font-bold text-slate-900 mb-4 tracking-tight">
            Payment Successful!
          </h1>
          <p className="text-xl text-slate-600 font-light">
            Thank you for your purchase. Your order is being processed.
          </p>
        </div>

        <div className="space-y-6">
          <Card className="bg-white/80 backdrop-blur-sm border border-slate-200 rounded-2xl p-8">
            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center shrink-0">
                  <Gift className="w-6 h-6 text-emerald-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-slate-900 mb-2">
                    Gift Cards Ordered
                  </h3>
                  <p className="text-slate-600 leading-relaxed">
                    Your gift cards will be delivered to your email within a few minutes. 
                    You can also view them in your Impact Dashboard.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center shrink-0">
                  <TrendingUp className="w-6 h-6 text-emerald-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-slate-900 mb-2">
                    Impact Credits Earned
                  </h3>
                  <p className="text-slate-600 leading-relaxed">
                    You've earned Impact Credits! Check your Impact Dashboard to see your balance 
                    and use them to vote on future charitable donations.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center shrink-0">
                  <Sparkles className="w-6 h-6 text-emerald-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-slate-900 mb-2">
                    Making an Impact
                  </h3>
                  <p className="text-slate-600 leading-relaxed">
                    50% of the profit from your purchase will go to verified charitable causes. 
                    Thank you for creating positive change!
                  </p>
                </div>
              </div>
            </div>
          </Card>

          <div className="flex flex-col sm:flex-row gap-4">
            <Link href="/impact" className="flex-1">
              <Button className="w-full h-12 rounded-xl bg-slate-900 hover:bg-slate-800 text-base font-medium">
                View Impact Dashboard
              </Button>
            </Link>
            <Link href="/marketplace" className="flex-1">
              <Button variant="outline" className="w-full h-12 rounded-xl text-base font-medium">
                Continue Shopping
              </Button>
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
