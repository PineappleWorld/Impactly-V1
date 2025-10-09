'use client';

import { useState, useEffect } from 'react';
import { SharedHeader } from '@/components/shared-header';
import Link from 'next/link';
import { Gift, Search, Loader as Loader2, CircleAlert as AlertCircle, Sparkles, Filter, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

type Product = {
  productId: number;
  productName: string;
  country: {
    isoName: string;
    name: string;
  };
  denominationType: 'FIXED' | 'RANGE';
  recipientCurrencyCode: string;
  fixedRecipientDenominations: number[];
  logoUrls: string[];
  brand: {
    brandId: number;
    brandName: string;
  };
};

type CountryInfo = {
  code: string;
  name: string;
};

export default function MarketplacePage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [allCountries, setAllCountries] = useState<CountryInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCountry, setSelectedCountry] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 24;

  console.log('MarketplacePage component rendered. Countries:', allCountries);

  useEffect(() => {
    console.log('useEffect triggered - calling fetchInitialData');
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      setLoading(true);
      setError(null);
      setProducts([]);
      console.log('🔍 Fetching products from API...');
      const response = await fetch('/api/reloadly/products?size=1000');
      console.log('📡 API response status:', response.status);

      if (response.ok) {
        const data = await response.json();
        console.log('📦 Full API response:', data);
        console.log('✅ Products received:', data.products?.length || 0);
        const productList = data.products || [];
        setProducts(productList);

        if (productList.length > 0) {
          const countryMap = new Map<string, string>();
          productList.forEach((p: Product) => {
            if (p.country?.isoName && p.country?.name) {
              countryMap.set(p.country.isoName, p.country.name);
            }
          });
          const countries: CountryInfo[] = Array.from(countryMap.entries())
            .map(([code, name]) => ({ code, name }))
            .sort((a, b) => a.name.localeCompare(b.name));
          setAllCountries(countries);
        } else {
          console.error('❌ No products in response');
          setError('No gift cards available. Please configure the gift card provider in admin settings.');
        }
      } else {
        const errorData = await response.json();
        console.error('❌ API error:', errorData);
        setError(errorData.error || 'Failed to load gift cards. Please configure API credentials in admin settings.');
      }
    } catch (error) {
      console.error('💥 Failed to fetch products:', error);
      setError('Unable to connect to gift card service. Please configure API credentials in admin settings.');
    } finally {
      setLoading(false);
    }
  };



  const filteredProducts = products.filter((product) => {
    const matchesSearch = product.productName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.brand.brandName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCountry = selectedCountry === 'all' || product.country?.isoName === selectedCountry;
    return matchesSearch && matchesCountry;
  });

  const totalPages = Math.ceil(filteredProducts.length / pageSize);
  const paginatedProducts = filteredProducts.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const goToPage = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const PaginationControls = () => (
    <div className="flex items-center justify-center gap-2 mt-12">
      <Button
        onClick={() => goToPage(currentPage - 1)}
        disabled={currentPage === 1}
        variant="outline"
        className="rounded-xl"
      >
        <ChevronLeft className="w-4 h-4 mr-1" />
        Previous
      </Button>

      <div className="flex items-center gap-2">
        {currentPage > 2 && (
          <>
            <Button onClick={() => goToPage(1)} variant="outline" className="rounded-xl w-10">
              1
            </Button>
            {currentPage > 3 && <span className="text-slate-500">...</span>}
          </>
        )}

        {currentPage > 1 && (
          <Button onClick={() => goToPage(currentPage - 1)} variant="outline" className="rounded-xl w-10">
            {currentPage - 1}
          </Button>
        )}

        <Button className="rounded-xl w-10 bg-slate-900 text-white">
          {currentPage}
        </Button>

        {currentPage < totalPages && (
          <Button onClick={() => goToPage(currentPage + 1)} variant="outline" className="rounded-xl w-10">
            {currentPage + 1}
          </Button>
        )}

        {currentPage < totalPages - 1 && (
          <>
            {currentPage < totalPages - 2 && <span className="text-slate-500">...</span>}
            <Button onClick={() => goToPage(totalPages)} variant="outline" className="rounded-xl w-10">
              {totalPages}
            </Button>
          </>
        )}
      </div>

      <Button
        onClick={() => goToPage(currentPage + 1)}
        disabled={currentPage === totalPages}
        variant="outline"
        className="rounded-xl"
      >
        Next
        <ChevronRight className="w-4 h-4 ml-1" />
      </Button>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-rose-50/30 to-amber-50/40">
      <SharedHeader />

      <main className="max-w-7xl mx-auto px-8 py-16">
        <div className="mb-16">
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-slate-900 mb-5 leading-tight tracking-tight">
            Gift Card Marketplace
          </h1>
          <p className="text-xl md:text-2xl text-slate-600 mb-10 font-light leading-relaxed">
            Discover amazing gift cards while making a positive impact
          </p>

          <div className="flex flex-col md:flex-row gap-4 max-w-3xl">
            <div className="relative flex-1">
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <Input
                type="text"
                placeholder="Search brands like Starbucks, Amazon..."
                value={searchQuery}
                onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                className="pl-14 h-14 rounded-2xl border border-slate-200 bg-white focus:border-slate-300 text-base shadow-sm"
              />
            </div>

            <div className="relative md:w-64">
              <Filter className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none z-10" />
              <Select value={selectedCountry} onValueChange={(val) => { setSelectedCountry(val); setCurrentPage(1); }}>
                <SelectTrigger className="h-14 pl-14 rounded-2xl border border-slate-200 bg-white text-base shadow-sm">
                  <SelectValue placeholder="All Countries" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Countries</SelectItem>
                  {allCountries.map((country) => (
                    <SelectItem key={country.code} value={country.code}>
                      {country.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {!loading && !error && filteredProducts.length > pageSize && <PaginationControls />}

        {error ? (
          <div className="flex flex-col items-center justify-center py-24">
            <div className="bg-white/80 backdrop-blur-sm border border-slate-200 rounded-3xl p-16 text-center shadow-lg max-w-md">
              <AlertCircle className="w-16 h-16 text-rose-500 mx-auto mb-6" />
              <h3 className="text-2xl font-semibold text-slate-900 mb-3">
                Unable to Load Gift Cards
              </h3>
              <p className="text-slate-600 mb-8 font-light">{error}</p>
              <Button onClick={fetchInitialData} className="rounded-full px-8 h-12 text-base font-medium bg-slate-900 hover:bg-slate-800 text-white shadow-sm">
                Try Again
              </Button>
            </div>
          </div>
        ) : loading ? (
          <div className="flex items-center justify-center py-32">
            <Loader2 className="w-12 h-12 text-slate-400 animate-spin" />
          </div>
        ) : (
          <>
            <div className="mb-8 text-base text-slate-600 font-light">
              Showing {paginatedProducts.length} of {filteredProducts.length} gift cards
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {paginatedProducts.map((product) => (
                <Link key={product.productId} href={`/marketplace/${product.productId}`}>
                  <Card className="bg-white/80 backdrop-blur-sm border border-slate-200/60 rounded-2xl hover:shadow-xl hover:bg-white transition-all hover:-translate-y-1 cursor-pointer overflow-hidden group">
                    <div className="aspect-[16/10] overflow-hidden bg-gradient-to-br from-slate-50 to-slate-100">
                      {product.logoUrls && product.logoUrls.length > 0 ? (
                        <img
                          src={product.logoUrls[0]}
                          alt={product.productName}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Gift className="w-20 h-20 text-slate-300" />
                        </div>
                      )}
                    </div>
                    <div className="p-6">
                      <div className="flex items-start justify-between gap-3 mb-3">
                        <h3 className="font-semibold text-xl text-slate-900 line-clamp-2 flex-1">
                          {product.brand.brandName}
                        </h3>
                        <span className="text-xs font-medium text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full shrink-0">
                          {product.country?.isoName}
                        </span>
                      </div>
                      {product.denominationType === 'FIXED' && product.fixedRecipientDenominations.length > 0 && (
                        <p className="text-base text-slate-600 font-light mb-3">
                          From {product.recipientCurrencyCode} {product.fixedRecipientDenominations[0]}
                        </p>
                      )}
                    </div>
                  </Card>
                </Link>
              ))}
            </div>

            {filteredProducts.length === 0 && !loading && (
              <div className="text-center py-32">
                <div className="bg-white/80 backdrop-blur-sm border border-slate-200 rounded-3xl p-16 inline-block shadow-lg">
                  <Gift className="w-16 h-16 text-slate-300 mx-auto mb-6" />
                  <h3 className="text-2xl font-semibold text-slate-900 mb-3">
                    No gift cards found
                  </h3>
                  <p className="text-slate-600 font-light">
                    Try adjusting your search or filter
                  </p>
                </div>
              </div>
            )}

            {!loading && !error && filteredProducts.length > pageSize && <PaginationControls />}
          </>
        )}
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
