'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { Gift, Loader as Loader2, CircleAlert as AlertCircle, Sparkles, ArrowLeft, ShoppingCart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { SharedHeader } from '@/components/shared-header';
import DOMPurify from 'isomorphic-dompurify';

// Type for products from database
type DatabaseProduct = {
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

// Type for products from Reloadly API
type ReloadlyProduct = {
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
    concise: string;
    verbose: string;
  };
};

type Product = DatabaseProduct | ReloadlyProduct;

// Type guard to check if product is from database
function isDatabaseProduct(product: Product): product is DatabaseProduct {
  return 'product_name' in product;
}

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

      const response = await fetch(`/api/products/${id}`);
      if (response.ok) {
        const data = await response.json();
        setProduct(data);
      } else {
        const errorData = await response.json().catch(() => ({}));
        setError(errorData.error || 'Product not found');
      }
    } catch (error) {
      console.error('Failed to fetch product:', error);
      setError('Unable to load product details');
    } finally {
      setLoading(false);
    }
  };

  // Helper functions to get product details regardless of source
  const getProductName = (product: Product) => {
    return isDatabaseProduct(product) ? product.product_name : product.productName;
  };

  const getBrandName = (product: Product) => {
    return isDatabaseProduct(product) ? product.brand_name : product.brand.brandName;
  };

  const getCountryCode = (product: Product) => {
    return isDatabaseProduct(product) ? product.country_code : product.countryCode;
  };

  const getCurrencyCode = (product: Product) => {
    return isDatabaseProduct(product) ? product.currency_code : product.recipientCurrencyCode;
  };

  const getLogoUrl = (product: Product) => {
    if (isDatabaseProduct(product)) {
      return product.logo_url;
    }
    return product.logoUrls && product.logoUrls.length > 0 ? product.logoUrls[0] : '';
  };

  const getDenominations = (product: Product) => {
    if (isDatabaseProduct(product)) {
      return product.product_data?.fixedRecipientDenominations || [];
    }
    return product.fixedRecipientDenominations || [];
  };

  const getDenominationType = (product: Product) => {
    if (isDatabaseProduct(product)) {
      return product.denomination_type;
    }
    return product.denominationType || 'FIXED';
  };

  const getMinDenomination = (product: Product) => {
    if (isDatabaseProduct(product)) {
      return product.min_denomination;
    }
    return product.minRecipientDenomination || 0;
  };

  const getMaxDenomination = (product: Product) => {
    if (isDatabaseProduct(product)) {
      return product.max_denomination;
    }
    return product.maxRecipientDenomination || 0;
  };

  const getRedeemInstructions = (product: Product) => {
    if (isDatabaseProduct(product)) {
      return product.product_data?.redeemInstruction?.concise || '';
    }
    return product.redeemInstruction?.concise || '';
  };

  const sanitize = (text: string) => {
    if (typeof window !== 'undefined') {
      return DOMPurify.sanitize(text, { ALLOWED_TAGS: [] });
    }
    return text;
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
            <p className="text-slate-600 mb-8 font-light">{sanitize(error || 'Unknown error')}</p>
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

  const productName = getProductName(product);
  const brandName = getBrandName(product);
  const countryCode = getCountryCode(product);
  const currencyCode = getCurrencyCode(product);
  const logoUrl = getLogoUrl(product);
  const denominations = getDenominations(product);
  const denominationType = getDenominationType(product);
  const minDenomination = getMinDenomination(product);
  const maxDenomination = getMaxDenomination(product);
  const redeemInstructions = getRedeemInstructions(product);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-rose-50/30 to-amber-50/40">
      <SharedHeader />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-16">
        <Link 
          href="/marketplace" 
          className="inline-flex items-center gap-2 text-slate-700 hover:text-slate-900 mb-6 sm:mb-8 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span className="text-sm sm:text-base">Back to Marketplace</span>
        </Link>

        <div className="grid md:grid-cols-2 gap-8 lg:gap-12 mb-12 lg:mb-16">
          {/* Product Image */}
          <div className="bg-white/80 backdrop-blur-sm border border-slate-200 rounded-3xl p-8 sm:p-12 flex items-center justify-center aspect-square md:aspect-auto">
            {logoUrl ? (
              <img
                src={sanitize(logoUrl)}
                alt={sanitize(brandName)}
                className="max-w-full max-h-96 object-contain"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                  (e.target as HTMLImageElement).parentElement!.innerHTML = `
                    <svg class="w-32 h-32 sm:w-48 sm:h-48 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7"></path>
                    </svg>
                  `;
                }}
              />
            ) : (
              <Gift className="w-32 h-32 sm:w-48 sm:h-48 text-slate-300" />
            )}
          </div>

          {/* Product Details */}
          <div className="flex flex-col">
            <div className="mb-4 sm:mb-6">
              <span className="text-xs sm:text-sm font-medium text-slate-500 bg-slate-100 px-3 py-1.5 rounded-full">
                {sanitize(countryCode)}
              </span>
            </div>
            
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-900 mb-3 sm:mb-4 tracking-tight">
              {sanitize(brandName)}
            </h1>
            
            <p className="text-lg sm:text-xl text-slate-600 font-light mb-6 sm:mb-8">
              {sanitize(productName)}
            </p>

            {/* Denominations Section */}
            {denominationType === 'FIXED' && denominations.length > 0 && (
              <Card className="bg-white/80 backdrop-blur-sm border border-slate-200 rounded-2xl p-4 sm:p-6 mb-6 sm:mb-8">
                <h3 className="font-semibold text-base sm:text-lg text-slate-900 mb-3 sm:mb-4">
                  Available Denominations
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3">
                  {denominations.slice(0, 9).map((amount: number) => (
                    <div
                      key={amount}
                      className="px-3 sm:px-4 py-2 sm:py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-medium text-center text-sm sm:text-base"
                    >
                      {sanitize(currencyCode)} {amount}
                    </div>
                  ))}
                </div>
                {denominations.length > 9 && (
                  <p className="text-xs sm:text-sm text-slate-500 mt-3 sm:mt-4">
                    +{denominations.length - 9} more denominations available
                  </p>
                )}
              </Card>
            )}

            {denominationType === 'RANGE' && (
              <Card className="bg-white/80 backdrop-blur-sm border border-slate-200 rounded-2xl p-4 sm:p-6 mb-6 sm:mb-8">
                <h3 className="font-semibold text-base sm:text-lg text-slate-900 mb-3 sm:mb-4">
                  Denomination Range
                </h3>
                <p className="text-slate-600 text-sm sm:text-base">
                  {sanitize(currencyCode)} {minDenomination} - {sanitize(currencyCode)} {maxDenomination}
                </p>
              </Card>
            )}

            {/* Social Impact Info */}
            <Card className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 sm:p-6 mb-6 sm:mb-8">
              <h3 className="font-semibold text-base sm:text-lg text-emerald-900 mb-2">
                Social Impact
              </h3>
              <p className="text-sm sm:text-base text-emerald-800 font-light leading-relaxed">
                Every purchase automatically contributes to verified charitable causes. You earn Impact Tickets to vote on future donations.
              </p>
            </Card>

            {/* Purchase Button */}
            <Button 
              onClick={() => router.push('/auth')}
              className="w-full rounded-2xl h-12 sm:h-14 text-base sm:text-lg font-medium bg-slate-900 hover:bg-slate-800 text-white shadow-lg transition-all hover:shadow-xl"
            >
              <ShoppingCart className="w-5 h-5 mr-2" />
              Purchase Gift Card
            </Button>

            {/* Redeem Instructions */}
            {redeemInstructions && (
              <Card className="bg-white/80 backdrop-blur-sm border border-slate-200 rounded-2xl p-4 sm:p-6 mt-6 sm:mt-8">
                <h3 className="font-semibold text-base sm:text-lg text-slate-900 mb-3">
                  How to Redeem
                </h3>
                <p className="text-sm sm:text-base text-slate-600 font-light leading-relaxed">
                  {sanitize(redeemInstructions)}
                </p>
              </Card>
            )}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white/80 backdrop-blur-md border-t border-slate-200/50 py-12 sm:py-16 mt-16 sm:mt-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 sm:gap-10">
            <div className="col-span-2 md:col-span-1">
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
                <li><Link href="/marketplace" className="hover:text-slate-900 transition-colors">Marketplace</Link></li>
                <li><Link href="/impact" className="hover:text-slate-900 transition-colors">Social Impact</Link></li>
                <li><Link href="/charities" className="hover:text-slate-900 transition-colors">Partners</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-slate-900 mb-4 text-sm uppercase tracking-wider">Company</h4>
              <ul className="space-y-2.5 text-sm text-slate-600 font-light">
                <li><Link href="/about" className="hover:text-slate-900 transition-colors">About</Link></li>
                <li><Link href="/contact" className="hover:text-slate-900 transition-colors">Contact</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-slate-900 mb-4 text-sm uppercase tracking-wider">Legal</h4>
              <ul className="space-y-2.5 text-sm text-slate-600 font-light">
                <li><Link href="/privacy" className="hover:text-slate-900 transition-colors">Privacy</Link></li>
                <li><Link href="/terms" className="hover:text-slate-900 transition-colors">Terms</Link></li>
                <li><Link href="/admin/login" className="hover:text-slate-900 transition-colors">Admin</Link></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-slate-200 mt-8 sm:mt-12 pt-6 sm:pt-8 text-center">
            <p className="text-sm font-medium text-slate-700 mb-2">Social Impact Economy</p>
            <p className="text-xs text-slate-500 font-light">© 2025 Impactly. All rights reserved</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
