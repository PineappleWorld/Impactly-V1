'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { Gift, Loader as Loader2, CircleAlert as AlertCircle, Sparkles, ArrowLeft, ShoppingCart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

type Product = {
  id: string;
  reloadly_product_id: number;
  product_name: string;
  brand_name: string;
  country_code: string;
  currency_code: string;
  min_denomination: number;
  max_denomination: number;
  denomination_type: 'FIXED' | 'RANGE';
  logo_url: string;
  product_data: any;
};

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (params.id) {
      fetchProduct(params.id as string);
    }
  }, [params.id]);

  const fetchProduct = async (id: string) => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/products/${id}`);
      if (response.ok) {
        const data = await response.json();
        setProduct(data);
      } else {
        setError('Product not found');
      }
    } catch (error) {
      console.error('Failed to fetch product:', error);
      setError('Unable to load product details');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-rose-50/30 to-amber-50/40 flex items-center justify-center">
        <Loader2 className="w-12 h-12 text-slate-400 animate-spin" />
      </div>
    );
  }

  if (error || !product) {
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
        <div className="flex flex-col items-center justify-center py-24 px-8">
          <div className="bg-white/80 backdrop-blur-sm border border-slate-200 rounded-3xl p-16 text-center shadow-lg max-w-md">
            <AlertCircle className="w-16 h-16 text-rose-500 mx-auto mb-6" />
            <h3 className="text-2xl font-semibold text-slate-900 mb-3">
              Product Not Found
            </h3>
            <p className="text-slate-600 mb-8 font-light">{error}</p>
            <Link href="/marketplace">
              <Button className="rounded-full px-8 h-12 text-base font-medium bg-slate-900 hover:bg-slate-800 text-white shadow-sm">
                Back to Marketplace
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const productData = product.product_data;
  const denominations = productData.fixedRecipientDenominations || [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-rose-50/30 to-amber-50/40">
      <header className="sticky top-0 z-50 backdrop-blur-md bg-white/80 border-b border-slate-200/50">
        <div className="max-w-7xl mx-auto px-8 py-5 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <Sparkles className="w-7 h-7 text-emerald-600" />
            <span className="text-2xl font-bold text-slate-900 tracking-tight">Impactly</span>
          </Link>
          <nav className="hidden md:flex items-center gap-10">
            <Link href="/marketplace" className="text-slate-900 font-medium">
              Marketplace
            </Link>
            <Link href="/impact" className="text-slate-700 hover:text-slate-900 transition-colors text-base">
              Social Impact
            </Link>
            <Link href="/charities" className="text-slate-700 hover:text-slate-900 transition-colors text-base">
              Partners
            </Link>
            <Link href="/auth">
              <Button className="rounded-full px-7 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-sm font-medium shadow-sm">
                Sign In
              </Button>
            </Link>
          </nav>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-8 py-16">
        <Link href="/marketplace" className="inline-flex items-center gap-2 text-slate-700 hover:text-slate-900 mb-8 transition-colors">
          <ArrowLeft className="w-5 h-5" />
          Back to Marketplace
        </Link>

        <div className="grid md:grid-cols-2 gap-12 mb-16">
          <div className="bg-white/80 backdrop-blur-sm border border-slate-200 rounded-3xl p-12 flex items-center justify-center">
            {product.logo_url ? (
              <img
                src={product.logo_url}
                alt={product.product_name}
                className="max-w-full max-h-96 object-contain"
              />
            ) : (
              <Gift className="w-48 h-48 text-slate-300" />
            )}
          </div>

          <div>
            <div className="mb-6">
              <span className="text-sm font-medium text-slate-500 bg-slate-100 px-3 py-1 rounded-full">
                {product.country_code}
              </span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4 tracking-tight">
              {product.brand_name}
            </h1>
            <p className="text-xl text-slate-600 font-light mb-8">
              {product.product_name}
            </p>

            {denominations.length > 0 && (
              <Card className="bg-white/80 backdrop-blur-sm border border-slate-200 rounded-2xl p-6 mb-8">
                <h3 className="font-semibold text-lg text-slate-900 mb-4">Available Denominations</h3>
                <div className="grid grid-cols-3 gap-3">
                  {denominations.map((amount: number) => (
                    <button
                      key={amount}
                      className="px-4 py-3 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-slate-900 font-medium transition-colors"
                    >
                      {product.currency_code} {amount}
                    </button>
                  ))}
                </div>
              </Card>
            )}

            {product.denomination_type === 'RANGE' && (
              <Card className="bg-white/80 backdrop-blur-sm border border-slate-200 rounded-2xl p-6 mb-8">
                <h3 className="font-semibold text-lg text-slate-900 mb-4">Denomination Range</h3>
                <p className="text-slate-600">
                  {product.currency_code} {product.min_denomination} - {product.currency_code} {product.max_denomination}
                </p>
              </Card>
            )}

            <Card className="bg-emerald-50 border border-emerald-200 rounded-2xl p-6 mb-8">
              <h3 className="font-semibold text-lg text-emerald-900 mb-2">Social Impact</h3>
              <p className="text-emerald-800 font-light">
                Every purchase automatically contributes to verified charitable causes. You earn Impact Tickets to vote on future donations.
              </p>
            </Card>

            <Button className="w-full rounded-2xl h-14 text-lg font-medium bg-slate-900 hover:bg-slate-800 text-white shadow-lg">
              <ShoppingCart className="w-5 h-5 mr-2" />
              Purchase Gift Card
            </Button>

            {productData.redeemInstruction?.concise && (
              <Card className="bg-white/80 backdrop-blur-sm border border-slate-200 rounded-2xl p-6 mt-8">
                <h3 className="font-semibold text-lg text-slate-900 mb-3">How to Redeem</h3>
                <p className="text-slate-600 font-light">
                  {productData.redeemInstruction.concise}
                </p>
              </Card>
            )}
          </div>
        </div>
      </main>

      <footer className="bg-white/80 backdrop-blur-md border-t border-slate-200/50 py-16 mt-24">
        <div className="max-w-7xl mx-auto px-8">
          <div className="grid md:grid-cols-4 gap-10">
            <div>
              <div className="flex items-center gap-2.5 mb-4">
                <Sparkles className="w-6 h-6 text-emerald-600" />
                <span className="text-xl font-bold text-slate-900 tracking-tight">Impactly</span>
              </div>
              <p className="text-slate-600 text-sm font-light leading-relaxed">
                BUY your favorite giftcards. EARN impact coin. VOTE with others on where our profits should go to create community change.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-slate-900 mb-4 text-sm uppercase tracking-wider">Product</h4>
              <ul className="space-y-2.5 text-sm text-slate-600 font-light">
                <li><Link href="/marketplace" className="hover:text-slate-900">Marketplace</Link></li>
                <li><Link href="/impact" className="hover:text-slate-900">Social Impact</Link></li>
                <li><Link href="/charities" className="hover:text-slate-900">Partners</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-slate-900 mb-4 text-sm uppercase tracking-wider">Company</h4>
              <ul className="space-y-2.5 text-sm text-slate-600 font-light">
                <li><Link href="/about" className="hover:text-slate-900">About</Link></li>
                <li><Link href="/contact" className="hover:text-slate-900">Contact</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-slate-900 mb-4 text-sm uppercase tracking-wider">Legal</h4>
              <ul className="space-y-2.5 text-sm text-slate-600 font-light">
                <li><Link href="/privacy" className="hover:text-slate-900">Privacy</Link></li>
                <li><Link href="/terms" className="hover:text-slate-900">Terms</Link></li>
                <li><Link href="/admin/login" className="hover:text-slate-900">Admin</Link></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-slate-200 mt-12 pt-8 text-center">
            <p className="text-sm font-medium text-slate-700 mb-2">Social Impact Economy</p>
            <p className="text-xs text-slate-500 font-light">© 2025 Impactly. All rights reserved</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
