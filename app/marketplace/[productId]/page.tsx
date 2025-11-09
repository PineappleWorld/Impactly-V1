'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { Gift, Loader2, AlertCircle, ShoppingCart, ArrowLeft, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { SharedHeader } from '@/components/shared-header';

type Product = {
  productId: number;
  productName: string;
  countryCode: string;
  logoUrls: string[];
  brand: {
    brandName: string;
  };
  fixedRecipientDenominations: number[];
  recipientCurrencyCode: string;
  denominationType?: 'FIXED' | 'RANGE';
  minRecipientDenomination?: number;
  maxRecipientDenomination?: number;
  redeemInstruction?: {
    concise?: string;
  };
};

export default function ProductDetailPage() {
  const params = useParams();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedDenomination, setSelectedDenomination] = useState<number | null>(null);

  useEffect(() => {
    if (params.productId) {
      fetchProduct(params.productId as string);
    }
  }, [params.productId]);

  const fetchProduct = async (id: string) => {
    try {
      setLoading(true);
      setError(null);

      // Validate productId is a number
      const productId = parseInt(id);
      if (isNaN(productId) || productId <= 0) {
        setError('Invalid product ID');
        setLoading(false);
        return;
      }

      const response = await fetch(`/api/products/${productId}`);
      
      if (response.ok) {
        const data = await response.json();
        setProduct(data);
        
        // Auto-select first denomination if available
        if (data.fixedRecipientDenominations && data.fixedRecipientDenominations.length > 0) {
          setSelectedDenomination(data.fixedRecipientDenominations[0]);
        }
      } else {
        const errorData = await response.json().catch(() => ({ error: 'Product not found' }));
        setError(errorData.error || 'Product not found');
      }
    } catch (err) {
      console.error('Failed to fetch product:', err);
      setError('Unable to load product details. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleBuyNow = () => {
    // TODO: Implement cart/purchase functionality
    if (selectedDenomination && product) {
      console.log('Purchasing:', {
        productId: product.productId,
        amount: selectedDenomination,
        currency: product.recipientCurrencyCode,
      });
      alert(`Adding ${product.brand.brandName} ${product.recipientCurrencyCode} ${selectedDenomination} to cart (functionality coming soon)`);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-rose-50/30 to-amber-50/40">
        <SharedHeader />
        <div className="flex items-center justify-center py-32">
          <Loader2 className="w-12 h-12 text-slate-400 animate-spin" />
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-rose-50/30 to-amber-50/40">
        <SharedHeader />
        <div className="flex flex-col items-center justify-center py-24 px-8">
          <div className="bg-white/80 backdrop-blur-sm border border-slate-200 rounded-3xl p-16 text-center shadow-lg max-w-md">
            <AlertCircle className="w-16 h-16 text-rose-500 mx-auto mb-6" />
            <h3 className="text-2xl font-semibold text-slate-900 mb-3">
              Product Not Found
            </h3>
            <p className="text-slate-600 mb-8 font-light">{error || 'The product you are looking for does not exist.'}</p>
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-rose-50/30 to-amber-50/40">
      <SharedHeader />

      <main className="max-w-7xl mx-auto px-8 py-16">
        {/* Breadcrumb Navigation */}
        <nav className="mb-8">
          <Link 
            href="/marketplace" 
            className="inline-flex items-center gap-2 text-slate-700 hover:text-slate-900 transition-colors font-light"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Marketplace
          </Link>
        </nav>

        <div className="grid md:grid-cols-2 gap-12 mb-16">
          {/* Product Image */}
          <div className="bg-white/80 backdrop-blur-sm border border-slate-200 rounded-3xl p-12 flex items-center justify-center">
            {product.logoUrls && product.logoUrls.length > 0 ? (
              <img
                src={product.logoUrls[0]}
                alt={product.productName}
                className="max-w-full max-h-96 object-contain"
              />
            ) : (
              <Gift className="w-48 h-48 text-slate-300" />
            )}
          </div>

          {/* Product Details */}
          <div>
            {/* Country Badge */}
            <div className="mb-6">
              <span className="text-sm font-medium text-slate-500 bg-slate-100 px-3 py-1.5 rounded-full">
                {product.countryCode}
              </span>
            </div>

            {/* Brand Name */}
            <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4 tracking-tight leading-tight">
              {product.brand.brandName}
            </h1>

            {/* Product Name */}
            <p className="text-xl text-slate-600 font-light mb-8 leading-relaxed">
              {product.productName}
            </p>

            {/* Fixed Denominations */}
            {product.fixedRecipientDenominations && product.fixedRecipientDenominations.length > 0 && (
              <Card className="bg-white/80 backdrop-blur-sm border border-slate-200 rounded-2xl p-6 mb-8">
                <h3 className="font-semibold text-lg text-slate-900 mb-4">Available Denominations</h3>
                <div className="grid grid-cols-3 gap-3">
                  {product.fixedRecipientDenominations.map((amount: number) => (
                    <button
                      key={amount}
                      onClick={() => setSelectedDenomination(amount)}
                      className={`px-4 py-3 border rounded-xl text-slate-900 font-medium transition-all ${
                        selectedDenomination === amount
                          ? 'bg-slate-900 text-white border-slate-900 shadow-sm'
                          : 'bg-slate-50 hover:bg-slate-100 border-slate-200'
                      }`}
                    >
                      {product.recipientCurrencyCode} {amount}
                    </button>
                  ))}
                </div>
              </Card>
            )}

            {/* Range Denominations */}
            {product.denominationType === 'RANGE' && product.minRecipientDenomination && product.maxRecipientDenomination && (
              <Card className="bg-white/80 backdrop-blur-sm border border-slate-200 rounded-2xl p-6 mb-8">
                <h3 className="font-semibold text-lg text-slate-900 mb-4">Denomination Range</h3>
                <p className="text-slate-600 font-light">
                  {product.recipientCurrencyCode} {product.minRecipientDenomination} - {product.recipientCurrencyCode} {product.maxRecipientDenomination}
                </p>
              </Card>
            )}

            {/* Social Impact Message */}
            <Card className="bg-emerald-50/80 backdrop-blur-sm border border-emerald-200 rounded-2xl p-6 mb-8">
              <div className="flex items-start gap-3">
                <Sparkles className="w-6 h-6 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-lg text-emerald-900 mb-2">Social Impact</h3>
                  <p className="text-emerald-800 font-light leading-relaxed">
                    Every purchase automatically contributes to verified charitable causes. You earn Impact Tickets to vote on future donations.
                  </p>
                </div>
              </div>
            </Card>

            {/* Buy Now Button */}
            <Button 
              onClick={handleBuyNow}
              disabled={!selectedDenomination && product.fixedRecipientDenominations && product.fixedRecipientDenominations.length > 0}
              className="w-full rounded-2xl h-14 text-lg font-medium bg-slate-900 hover:bg-slate-800 text-white shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              <ShoppingCart className="w-5 h-5 mr-2" />
              Buy Now
            </Button>

            {/* Redeem Instructions */}
            {product.redeemInstruction?.concise && (
              <Card className="bg-white/80 backdrop-blur-sm border border-slate-200 rounded-2xl p-6 mt-8">
                <h3 className="font-semibold text-lg text-slate-900 mb-3">How to Redeem</h3>
                <p className="text-slate-600 font-light leading-relaxed">
                  {product.redeemInstruction.concise}
                </p>
              </Card>
            )}
          </div>
        </div>
      </main>

      {/* Footer */}
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
