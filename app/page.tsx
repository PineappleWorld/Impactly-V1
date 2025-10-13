'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Heart, Users, Zap, CreditCard, Gift } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { SharedHeader } from '@/components/shared-header';
import { SharedFooter } from '@/components/shared-footer';

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
};

type Nonprofit = {
  nonprofitSlug: string;
  name: string;
  description: string;
  logoUrl: string;
  coverImageUrl: string;
  category: string;
};

export default function Home() {
  const [products, setProducts] = useState<Product[]>([]);
  const [nonprofits, setNonprofits] = useState<Nonprofit[]>([]);
  const [loading, setLoading] = useState(true);
  const [nonprofitsLoading, setNonprofitsLoading] = useState(true);

  useEffect(() => {
    fetchProducts();
    fetchNonprofits();
  }, []);

  const fetchProducts = async () => {
    try {
      const featuredResponse = await fetch('/api/featured/products');
      if (featuredResponse.ok) {
        const featuredData = await featuredResponse.json();
        if (featuredData.featured && featuredData.featured.length > 0) {
          const productIds = featuredData.featured.map((f: any) => f.product_id);
          const productPromises = productIds.slice(0, 8).map((id: number) =>
            fetch(`/api/products/${id}`).then(res => res.ok ? res.json() : null)
          );
          const productResults = await Promise.all(productPromises);
          const validProducts = productResults.filter(p => p !== null);
          if (validProducts.length > 0) {
            setProducts(validProducts);
            setLoading(false);
            return;
          }
        }
      }

      const response = await fetch('/api/reloadly/products?size=200');
      if (response.ok) {
        const data = await response.json();
        const usProducts = data.products.filter((p: Product) => p.countryCode === 'US').slice(0, 8);
        setProducts(usProducts);
      }
    } catch (error) {
      console.error('Failed to fetch products:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchNonprofits = async () => {
    try {
      const featuredResponse = await fetch('/api/featured/nonprofits');
      if (featuredResponse.ok) {
        const featuredData = await featuredResponse.json();
        if (featuredData.featured && featuredData.featured.length > 0) {
          const slugs = featuredData.featured.map((f: any) => f.nonprofit_slug).slice(0, 4);
          const nonprofitPromises = slugs.map((slug: string) =>
            fetch(`/api/nonprofits?slug=${slug}`).then(res => res.ok ? res.json() : null)
          );
          const results = await Promise.all(nonprofitPromises);
          const validNonprofits = results.filter(r => r && r.nonprofits && r.nonprofits.length > 0).map(r => r.nonprofits[0]);
          if (validNonprofits.length > 0) {
            setNonprofits(validNonprofits);
            setNonprofitsLoading(false);
            return;
          }
        }
      }

      const response = await fetch('/api/nonprofits?perPage=4&cause=humans');
      if (response.ok) {
        const data = await response.json();
        if (!data.needsSync) {
          setNonprofits(data.nonprofits || []);
        }
      } else if (response.status === 503) {
        setNonprofits([]);
      }
    } catch (error) {
      console.error('Failed to fetch nonprofits:', error);
      setNonprofits([]);
    } finally {
      setNonprofitsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-rose-50/30 to-amber-50/40">
      <SharedHeader />

      <main>
        <section className="relative max-w-7xl mx-auto px-8 py-28 md:py-36">
          <div className="absolute inset-0 -z-10 overflow-hidden">
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-gradient-to-br from-rose-200/30 via-amber-200/20 to-transparent rounded-full blur-3xl"></div>
            <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-gradient-to-tr from-emerald-200/20 via-teal-200/20 to-transparent rounded-full blur-3xl"></div>
          </div>

          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-6xl md:text-7xl lg:text-8xl font-bold text-slate-900 mb-8 leading-[1.05] tracking-tight">
              Join The
              <br />
              <span className="bg-gradient-to-r from-lime-500 via-emerald-600 to-teal-700 text-transparent bg-clip-text">Impact Economy</span>
            </h1>
            <p className="text-sm md:text-lg text-slate-700 mb-14 leading-relaxed mx-auto font-light">
              <span className="font-semibold">Buy</span> your favorite gift cards. <span className="font-semibold">Earn</span> Impact Credits. <span className="font-semibold">Support</span> verified causes.
            </p>
            <div className="flex items-center justify-center gap-4">
              <Link href="/marketplace">
                <Button size="lg" className="rounded-full px-10 py-7 text-lg font-medium bg-slate-900 hover:bg-slate-800 text-white shadow-lg transition-all hover:shadow-xl">
                  Start Shopping
                </Button>
              </Link>
              <Link href="/how-it-works">
                <Button size="lg" variant="outline" className="rounded-full px-10 py-7 text-lg font-medium bg-white/80 hover:bg-white border-slate-300 text-slate-900 transition-all">
                  How It Works
                </Button>
              </Link>
            </div>
          </div>
        </section>

        <section className="py-20 relative">
          <div className="max-w-7xl mx-auto px-8">
            <div className="mb-14">
              <h2 className="text-5xl md:text-6xl font-bold text-slate-900 mb-4 tracking-tight">
                Popular Gift Cards
              </h2>
              <p className="text-xl text-slate-600 font-light">
                Start making an impact with these top brands
              </p>
            </div>

            {loading ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5">
                {[...Array(8)].map((_, i) => (
                  <div key={i} className="bg-white/60 rounded-2xl h-72 animate-pulse"></div>
                ))}
              </div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5">
                {products.map((product) => (
                  <Link key={product.productId} href={`/marketplace/${product.productId}`}> 
                    <Card className="bg-white/80 backdrop-blur-sm border border-slate-200/60 rounded-2xl hover:shadow-xl hover:bg-white transition-all hover:-translate-y-1 cursor-pointer overflow-hidden">
                      <div className="aspect-[4/3] bg-gradient-to-br from-slate-100 to-slate-50 flex items-center justify-center overflow-hidden">
                        {product.logoUrls && product.logoUrls.length > 0 ? (
                          <img
                            src={product.logoUrls[0]}
                            alt={product.productName}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                        ) : (
                          <Gift className="w-16 h-16 text-slate-300" />
                        )}
                      </div>
                      <CardContent className="p-5">
                        <h3 className="font-semibold text-lg text-slate-900 mb-1.5 line-clamp-2">
                          {product.brand.brandName}
                        </h3>
                       
