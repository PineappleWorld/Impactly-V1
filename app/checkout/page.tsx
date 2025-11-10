'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Sparkles, ShoppingCart, ArrowLeft, Loader2, CreditCard, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useAuth } from '@/lib/auth-context';
import { useCart } from '@/lib/cart-context';

export default function CheckoutPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const { items, clearCart } = useCart();
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth?redirect=/checkout');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (!authLoading && items.length === 0) {
      router.push('/marketplace');
    }
  }, [items, authLoading, router]);

  const subtotal = items.reduce((sum, item) => sum + item.denomination * item.quantity, 0);
  const estimatedProfit = subtotal * 0.05; // Rough 5% markup estimate
  const estimatedCharity = estimatedProfit * 0.5; // 50% goes to charity
  const estimatedImpactCredits = Math.floor(estimatedCharity * 10); // 10 credits per dollar

  const handleCheckout = async () => {
    if (!user) return;

    setProcessing(true);
    setError(null);

    try {
      const response = await fetch('/api/checkout/create-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          items,
          userId: user.id,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create checkout session');
      }

      // Redirect to Stripe Checkout
      if (data.url) {
        window.location.href = data.url;
      } else {
        throw new Error('No checkout URL returned');
      }
    } catch (err: any) {
      console.error('Checkout error:', err);
      setError(err.message || 'Failed to process checkout. Please try again.');
      setProcessing(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-rose-50/30 to-amber-50/40 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-emerald-600 animate-spin" />
      </div>
    );
  }

  if (!user || items.length === 0) {
    return null;
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

      <main className="max-w-6xl mx-auto px-8 py-16">
        <Link href="/marketplace" className="inline-flex items-center gap-2 text-slate-700 hover:text-slate-900 mb-8 transition-colors">
          <ArrowLeft className="w-5 h-5" />
          Back to Marketplace
        </Link>

        <h1 className="text-5xl font-bold text-slate-900 mb-12 tracking-tight">Checkout</h1>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Order Summary */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="bg-white/80 backdrop-blur-sm border border-slate-200 rounded-2xl p-6">
              <h2 className="text-2xl font-semibold text-slate-900 mb-6 flex items-center gap-2">
                <ShoppingCart className="w-6 h-6" />
                Order Summary
              </h2>

              <div className="space-y-4">
                {items.map((item) => (
                  <div
                    key={`${item.productId}-${item.denomination}`}
                    className="flex gap-4 pb-4 border-b border-slate-200 last:border-0"
                  >
                    <div className="w-16 h-16 bg-slate-100 rounded-xl flex items-center justify-center shrink-0 overflow-hidden">
                      {item.logoUrl ? (
                        <img
                          src={item.logoUrl}
                          alt={item.brandName}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <ShoppingCart className="w-6 h-6 text-slate-400" />
                      )}
                    </div>

                    <div className="flex-1">
                      <h3 className="font-semibold text-slate-900">{item.brandName}</h3>
                      <p className="text-sm text-slate-600">
                        {item.currency} {item.denomination} × {item.quantity}
                      </p>
                    </div>

                    <div className="text-right">
                      <p className="font-semibold text-slate-900">
                        USD {(item.denomination * item.quantity).toFixed(2)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            {error && (
              <Card className="bg-red-50 border border-red-200 rounded-2xl p-6">
                <p className="text-red-800 font-medium">{error}</p>
              </Card>
            )}
          </div>

          {/* Payment Summary */}
          <div className="space-y-6">
            <Card className="bg-white/80 backdrop-blur-sm border border-slate-200 rounded-2xl p-6">
              <h3 className="text-xl font-semibold text-slate-900 mb-4">Payment Summary</h3>

              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-slate-700">
                  <span>Subtotal</span>
                  <span className="font-medium">USD {subtotal.toFixed(2)}</span>
                </div>
              </div>

              <div className="border-t border-slate-200 pt-4 mb-6">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-semibold text-slate-900">Total</span>
                  <span className="text-2xl font-bold text-slate-900">
                    USD {subtotal.toFixed(2)}
                  </span>
                </div>
              </div>

              <Button
                onClick={handleCheckout}
                disabled={processing}
                className="w-full h-12 rounded-xl bg-slate-900 hover:bg-slate-800 text-base font-medium"
              >
                {processing ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <CreditCard className="w-5 h-5 mr-2" />
                    Pay with Stripe
                  </>
                )}
              </Button>

              <div className="flex items-center justify-center gap-2 mt-4 text-sm text-slate-500">
                <Lock className="w-4 h-4" />
                <span>Secure payment powered by Stripe</span>
              </div>
            </Card>

            <Card className="bg-emerald-50 border border-emerald-200 rounded-2xl p-6">
              <div className="flex items-start gap-3 mb-4">
                <Sparkles className="w-6 h-6 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-emerald-900 mb-1">Social Impact</h3>
                  <p className="text-sm text-emerald-800 leading-relaxed">
                    Your purchase will contribute approximately ${estimatedCharity.toFixed(2)} to verified charitable causes.
                  </p>
                </div>
              </div>

              <div className="bg-white/60 rounded-xl p-3">
                <p className="text-sm text-emerald-900 font-medium">
                  You'll earn ~{estimatedImpactCredits} Impact Credits
                </p>
                <p className="text-xs text-emerald-700 mt-1">
                  Use credits to vote on where future donations go
                </p>
              </div>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
