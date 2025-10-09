'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Sparkles, ArrowLeft, Heart, Loader as Loader2, CircleAlert as AlertCircle, Search, Filter, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

type Nonprofit = {
  nonprofitSlug: string;
  name: string;
  description: string;
  logoUrl: string;
  coverImageUrl: string;
  category: string;
  locationAddress: string;
};

const CATEGORIES = ['all', 'animals', 'arts', 'education', 'environment', 'health', 'humans', 'research'];

const CATEGORY_API_MAP: Record<string, string> = {
  'all': 'all',
  'animals': 'animals',
  'arts': 'culture',
  'education': 'education',
  'environment': 'environment',
  'health': 'health',
  'humans': 'humans',
  'research': 'research',
};

export default function CharitiesPage() {
  const [allNonprofits, setAllNonprofits] = useState<Nonprofit[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 24;

  useEffect(() => {
    fetchNonprofits();
  }, [selectedCategory]);

  const fetchNonprofits = async () => {
    try {
      setLoading(true);
      setError(null);
      setAllNonprofits([]);

      const apiCategory = selectedCategory === 'all' ? '' : CATEGORY_API_MAP[selectedCategory];
      const response = await fetch(`/api/nonprofits?perPage=100000&cause=${apiCategory}&page=1`);

      if (response.ok) {
        const data = await response.json();
        setAllNonprofits(data.nonprofits || []);

        if (data.liveApi) {
          console.log(`✅ Loaded ${data.nonprofits?.length || 0} organizations from live API`);
        } else if (data.cacheEmpty) {
          console.warn('⚠️ Cache is empty. Organizations need to be synced.');
          setError('No organizations in cache. Please contact administrator to run sync from admin dashboard.');
        } else {
          console.log(`✅ Loaded ${data.nonprofits?.length || 0} organizations from cache`);
        }

        if (data.message) {
          console.log(`ℹ️ ${data.message}`);
        }
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to load partners');
        if (errorData.suggestion) {
          console.error('Suggestion:', errorData.suggestion);
        }
      }
    } catch (error) {
      console.error('Failed to fetch nonprofits:', error);
      setError('Unable to connect to partners service. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const filteredNonprofits = allNonprofits.filter((nonprofit) => {
    const matchesSearch = !searchQuery ||
      nonprofit.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      nonprofit.description?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  const totalPages = Math.ceil(filteredNonprofits.length / pageSize);
  const paginatedNonprofits = filteredNonprofits.slice(
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
      <header className="sticky top-0 z-50 backdrop-blur-md bg-white/80 border-b border-slate-200/50">
        <div className="max-w-7xl mx-auto px-8 py-5 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <Sparkles className="w-7 h-7 text-emerald-600" />
            <span className="text-2xl font-bold text-slate-900 tracking-tight">Impactly</span>
          </Link>
          <nav className="hidden md:flex items-center gap-10">
            <Link href="/marketplace" className="text-slate-700 hover:text-slate-900 transition-colors text-base">
              Marketplace
            </Link>
            <Link href="/impact" className="text-slate-700 hover:text-slate-900 transition-colors text-base">
              Social Impact
            </Link>
            <Link href="/charities" className="text-slate-900 font-medium">
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
        <div className="mb-16">
          <Link href="/" className="inline-flex items-center gap-2 text-slate-700 hover:text-slate-900 mb-8 transition-colors">
            <ArrowLeft className="w-5 h-5" />
            Back to Home
          </Link>

          <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-slate-900 mb-5 leading-tight tracking-tight">
            Social Impact Partners
          </h1>
          <p className="text-xl md:text-2xl text-slate-600 mb-12 font-light max-w-2xl">
            Discover hundreds of verified nonprofits making a real difference
          </p>

          <div className="flex flex-col md:flex-row gap-4 max-w-3xl">
            <div className="relative flex-1">
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <Input
                type="text"
                placeholder="Search nonprofits..."
                value={searchQuery}
                onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                className="pl-14 h-14 rounded-2xl border border-slate-200 bg-white focus:border-slate-300 text-base shadow-sm"
              />
            </div>

            <div className="relative md:w-64">
              <Filter className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none z-10" />
              <Select value={selectedCategory} onValueChange={(val) => { setSelectedCategory(val); setCurrentPage(1); }}>
                <SelectTrigger className="h-14 pl-14 rounded-2xl border border-slate-200 bg-white text-base shadow-sm">
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category.charAt(0).toUpperCase() + category.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {!loading && !error && filteredNonprofits.length > pageSize && <PaginationControls />}

        {error ? (
          <div className="flex flex-col items-center justify-center py-24">
            <div className="bg-white/80 backdrop-blur-sm border border-slate-200 rounded-3xl p-16 text-center shadow-lg max-w-lg">
              <AlertCircle className="w-16 h-16 text-rose-500 mx-auto mb-6" />
              <h3 className="text-2xl font-semibold text-slate-900 mb-3">
                Unable to Load Partners
              </h3>
              <p className="text-slate-600 mb-6 font-light">{error}</p>
              {error.includes('cache') && (
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6 text-left">
                  <h4 className="font-semibold text-sm text-blue-900 mb-2">Setup Required:</h4>
                  <ol className="text-sm text-blue-800 space-y-1 list-decimal list-inside">
                    <li>Log in to the admin dashboard</li>
                    <li>Navigate to the Nonprofit Sync section</li>
                    <li>Click "Start Full Sync" to populate organizations</li>
                    <li>Wait for sync to complete</li>
                    <li>Return here and refresh the page</li>
                  </ol>
                  <Link href="/admin/login" className="inline-block mt-3">
                    <Button variant="outline" size="sm" className="text-blue-700 border-blue-300 hover:bg-blue-100">
                      Go to Admin Dashboard
                    </Button>
                  </Link>
                </div>
              )}
              <Button onClick={fetchNonprofits} className="rounded-full px-8 h-12 text-base font-medium bg-slate-900 hover:bg-slate-800 text-white shadow-sm">
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
              Showing {paginatedNonprofits.length} of {filteredNonprofits.length} partner organizations
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {paginatedNonprofits.map((nonprofit) => (
                <Card
                  key={nonprofit.nonprofitSlug}
                  className="bg-white/80 backdrop-blur-sm border border-slate-200/60 rounded-2xl hover:shadow-xl hover:bg-white transition-all hover:-translate-y-1 overflow-hidden group"
                >
                  <div className="aspect-video overflow-hidden bg-gradient-to-br from-slate-50 to-slate-100">
                    {nonprofit.coverImageUrl || nonprofit.logoUrl ? (
                      <img
                        src={nonprofit.coverImageUrl || nonprofit.logoUrl}
                        alt={nonprofit.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Heart className="w-20 h-20 text-slate-300" />
                      </div>
                    )}
                  </div>
                  <div className="p-6">
                    <h3 className="font-semibold text-xl text-slate-900 mb-2 line-clamp-2">
                      {nonprofit.name}
                    </h3>
                    {nonprofit.category && (
                      <p className="text-xs font-medium text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full inline-block mb-3">
                        {nonprofit.category}
                      </p>
                    )}
                    {nonprofit.description && (
                      <p className="text-sm text-slate-600 font-light line-clamp-3 mb-4">
                        {nonprofit.description}
                      </p>
                    )}
                    {nonprofit.locationAddress && (
                      <p className="text-xs text-slate-500 font-light">
                        {nonprofit.locationAddress}
                      </p>
                    )}
                  </div>
                </Card>
              ))}
            </div>

            {filteredNonprofits.length === 0 && !loading && (
              <div className="text-center py-32">
                <div className="bg-white/80 backdrop-blur-sm border border-slate-200 rounded-3xl p-16 inline-block shadow-lg">
                  <Heart className="w-16 h-16 text-slate-300 mx-auto mb-6" />
                  <h3 className="text-2xl font-semibold text-slate-900 mb-3">
                    No partners found
                  </h3>
                  <p className="text-slate-600 font-light mb-8">
                    Try adjusting your search or filter
                  </p>
                  <Link href="/marketplace">
                    <Button className="rounded-full px-10 py-6 text-lg font-medium bg-slate-900 hover:bg-slate-800 text-white shadow-lg">
                      Browse Gift Cards
                    </Button>
                  </Link>
                </div>
              </div>
            )}

            {!loading && !error && filteredNonprofits.length > pageSize && <PaginationControls />}
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
                BUY your favorite giftcards. EARN impact coin. VOTE with others on where profits should go to create community change.
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
