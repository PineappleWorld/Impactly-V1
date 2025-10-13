'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Heart, Users, Zap, CreditCard, Gift } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { SharedHeader } from '@/components/shared-header';
import { SharedFooter } from '@/components/shared-footer';
import { motion } from 'framer-motion';

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
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50/30 to-pink-50/40">
      <SharedHeader />

      <main>
        <section className="relative max-w-7xl mx-auto px-8 py-28 md:py-36">
          <div className="absolute inset-0 -z-10 overflow-hidden">
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-gradient-to-br from-purple-200/30 via-indigo-200/20 to-transparent rounded-full blur-3xl"></div>
            <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-gradient-to-tr from-lavender-200/20 via-midnight-200/20 to-transparent rounded-full blur-3xl"></div>
          </div>

          <motion.div
            className="max-w-4xl mx-auto text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-6xl md:text-7xl lg:text-8xl font-bold text-slate-900 mb-8 leading-[1.05] tracking-tight">
              Join The
              <br />
              <span
                className="text-transparent bg-clip-text"
                style={{
                  backgroundImage: 'url(https://images.unsplash.com/photo-1446776653964-20c1d3a81b06?w=1200&q=80)',
                  backgroundSize: 'cover',
                  backgroundPosition: 'center'
                }}
              >
                Impact Economy
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-slate-700 mb-14 leading-relaxed max-w-3xl mx-auto font-light">
              <span className="font-semibold">BUY</span> your favorite gift cards. <span className="font-semibold">EARN</span> Impact Credits. <span className="font-semibold">SUPPORT</span> verified causes.
            </p>
            <motion.div
              className="flex items-center justify-center gap-4"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              <Link href="/marketplace">
                <Button size="lg" className="rounded-full px-10 py-7 text-lg font-medium bg-indigo-900 hover:bg-indigo-800 text-white shadow-lg transition-all hover:shadow-xl hover:scale-105">
                  Start Shopping
                </Button>
              </Link>
              <Link href="/how-it-works">
                <Button size="lg" variant="outline" className="rounded-full px-10 py-7 text-lg font-medium bg-white/80 hover:bg-white border-indigo-300 text-indigo-900 transition-all hover:scale-105">
                  How It Works
                </Button>
              </Link>
            </motion.div>
          </motion.div>
        </section>

        <motion.section
          className="py-20 relative"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
        >
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
                    <Card className="bg-white/80 backdrop-blur-sm border border-slate-200/60 rounded-2xl hover:shadow-xl hover:bg-white transition-all hover:-translate-y-1 hover:scale-105 cursor-pointer overflow-hidden">
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
                        {product.fixedRecipientDenominations.length > 0 && (
                          <p className="text-sm text-slate-500">
                            From {product.recipientCurrencyCode} {product.fixedRecipientDenominations[0]}
                          </p>
                        )}
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            )}

            <div className="text-center mt-14">
              <Link href="/marketplace">
                <Button size="lg" className="rounded-full px-10 py-6 text-lg font-medium bg-indigo-900 hover:bg-indigo-800 text-white shadow-lg transition-all hover:scale-105">
                  View All Gift Cards
                </Button>
              </Link>
            </div>
          </div>
        </motion.section>

        <motion.section
          className="bg-white/50 backdrop-blur-sm py-24"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
        >
          <div className="max-w-7xl mx-auto px-8">
            <div className="grid md:grid-cols-3 gap-16">
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-2xl shadow-lg mb-6">
                  <CreditCard className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-semibold text-slate-900 mb-3">
                  Choose Your Gift Card
                </h3>
                <p className="text-lg text-slate-600 leading-relaxed font-light">
                  Browse hundreds of gift cards from top brands. Same great value, now with purpose
                </p>
              </div>

              <div className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl shadow-lg mb-6">
                  <Zap className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-semibold text-slate-900 mb-3">
                  Automatic Impact Split
                </h3>
                <p className="text-lg text-slate-600 leading-relaxed font-light">
                  50% of profit Impactly earns from your purchase goes directly to verified causes you support. Track impact in real-time
                </p>
              </div>

              <div className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-pink-500 to-indigo-500 rounded-2xl shadow-lg mb-6">
                  <Heart className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-semibold text-slate-900 mb-3">
                  Earn Impact Credits
                </h3>
                <p className="text-lg text-slate-600 leading-relaxed font-light">
                  Every purchase earns Impact Credits which can be redeemed or donated to causes you love
                </p>
              </div>
            </div>
          </div>
        </motion.section>

        <motion.section
          className="py-24"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.8 }}
        >
          <div className="max-w-7xl mx-auto px-8">
            <div className="text-center mb-16">
              <h2 className="text-5xl md:text-6xl font-bold text-slate-900 mb-5 tracking-tight">
                Social Impact Partners
              </h2>
              <p className="text-xl text-slate-600 max-w-2xl mx-auto font-light">
                We connect with verified nonprofits to ensure our contributions drive meaningful change
              </p>
            </div>

            {nonprofitsLoading ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="bg-white/60 rounded-2xl h-64 animate-pulse"></div>
                ))}
              </div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5">
                {nonprofits.map((nonprofit) => (
                  <Link key={nonprofit.nonprofitSlug} href="/charities">
                    <div className="bg-white/80 backdrop-blur-sm border border-slate-200/60 rounded-2xl overflow-hidden hover:shadow-xl hover:bg-white transition-all hover:-translate-y-1 hover:scale-105 group cursor-pointer">
                      <div className="aspect-video overflow-hidden bg-gradient-to-br from-slate-100 to-slate-50">
                        {nonprofit.coverImageUrl || nonprofit.logoUrl ? (
                          <img
                            src={nonprofit.coverImageUrl || nonprofit.logoUrl}
                            alt={nonprofit.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Heart className="w-16 h-16 text-slate-300" />
                          </div>
                        )}
                      </div>
                      <div className="p-5">
                        <h3 className="font-semibold text-lg text-slate-900 mb-1 line-clamp-1">{nonprofit.name}</h3>
                        {nonprofit.category && (
                          <p className="text-sm text-slate-500">{nonprofit.category}</p>
                        )}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}

            <div className="text-center mt-14">
              <Link href="/charities">
                <Button size="lg" className="rounded-full px-10 py-6 text-lg font-medium bg-indigo-900 hover:bg-indigo-800 text-white shadow-lg transition-all hover:scale-105">
                  View All Partners
                </Button>
              </Link>
            </div>
          </div>
        </motion.section>

      </main>

      <SharedFooter />
    </div>
  );
}