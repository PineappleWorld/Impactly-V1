'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Trash2, Plus, Gift, Heart } from 'lucide-react';
import { supabase } from '@/lib/supabase';

type FeaturedProduct = {
  id: string;
  product_id: number;
  display_order: number;
  is_active: boolean;
};

type FeaturedNonprofit = {
  id: string;
  nonprofit_slug: string;
  display_order: number;
  is_active: boolean;
};

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

export function FeaturedManager() {
  const [featuredProducts, setFeaturedProducts] = useState<FeaturedProduct[]>([]);
  const [featuredNonprofits, setFeaturedNonprofits] = useState<FeaturedNonprofit[]>([]);
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [allNonprofits, setAllNonprofits] = useState<Nonprofit[]>([]);
  const [searchProduct, setSearchProduct] = useState('');
  const [searchNonprofit, setSearchNonprofit] = useState('');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedNonprofit, setSelectedNonprofit] = useState<Nonprofit | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingAll, setLoadingAll] = useState(false);

  useEffect(() => {
    loadFeatured();
    fetchAll();
  }, []);

  const loadFeatured = async () => {
    try {
      const [productsRes, nonprofitsRes] = await Promise.all([
        supabase.from('featured_products').select('*').order('display_order'),
        supabase.from('featured_nonprofits').select('*').order('display_order'),
      ]);

      setFeaturedProducts(productsRes.data || []);
      setFeaturedNonprofits(nonprofitsRes.data || []);
    } catch (error) {
      console.error('Error loading featured items:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAll = async () => {
    setLoadingAll(true);
    try {
      const [productsRes, nonprofitsRes] = await Promise.all([
        fetch('/api/reloadly/products?size=200'),
        fetch('/api/nonprofits?perPage=100')
      ]);

      if (productsRes.ok) {
        const productsData = await productsRes.json();
        setAllProducts(productsData.products || []);
      }

      if (nonprofitsRes.ok) {
        const nonprofitsData = await nonprofitsRes.json();
        setAllNonprofits(nonprofitsData.nonprofits || []);
      }
    } catch (error) {
      console.error('Error fetching all items:', error);
    } finally {
      setLoadingAll(false);
    }
  };

  const filteredProducts = allProducts.filter(p =>
    p.brand.brandName.toLowerCase().includes(searchProduct.toLowerCase()) ||
    p.productName.toLowerCase().includes(searchProduct.toLowerCase())
  ).slice(0, 10);

  const filteredNonprofits = allNonprofits.filter(n =>
    n.name.toLowerCase().includes(searchNonprofit.toLowerCase()) ||
    n.nonprofitSlug.toLowerCase().includes(searchNonprofit.toLowerCase())
  ).slice(0, 10);

  const addFeaturedProduct = async (id: number) => {
    try {
      const { error } = await supabase.from('featured_products').insert({
        product_id: id,
        display_order: featuredProducts.length,
      });

      if (error) throw error;

      loadFeatured();
    } catch (error) {
      console.error('Error adding featured product:', error);
    }
  };

  const addFeaturedNonprofit = async (slug: string) => {
    try {
      const { error } = await supabase.from('featured_nonprofits').insert({
        nonprofit_slug: slug,
        display_order: featuredNonprofits.length,
      });

      if (error) throw error;

      loadFeatured();
    } catch (error) {
      console.error('Error adding featured nonprofit:', error);
    }
  };

  const removeFeaturedProduct = async (id: string) => {
    try {
      const { error } = await supabase.from('featured_products').delete().eq('id', id);

      if (error) throw error;

      loadFeatured();
    } catch (error) {
      console.error('Error removing featured product:', error);
    }
  };

  const removeFeaturedNonprofit = async (id: string) => {
    try {
      const { error } = await supabase.from('featured_nonprofits').delete().eq('id', id);

      if (error) throw error;

      loadFeatured();
    } catch (error) {
      console.error('Error removing featured nonprofit:', error);
    }
  };

  if (loading) {
    return <div className="text-center py-8 text-slate-600">Loading...</div>;
  }

  return (
    <div className="grid md:grid-cols-2 gap-8">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Gift className="w-5 h-5 text-emerald-600" />
            <CardTitle>Featured Gift Cards</CardTitle>
          </div>
          <CardDescription>
            Manage which gift cards appear in the featured section on homepage and marketplace
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Input
                type="text"
                placeholder="Search gift cards by name"
                value={searchProduct}
                onChange={(e) => setSearchProduct(e.target.value)}
              />
              {searchProduct && filteredProducts.length > 0 && (
                <div className="absolute z-10 w-full bg-white border border-slate-200 rounded-lg mt-1 shadow-lg max-h-60 overflow-y-auto">
                  {filteredProducts.map((product) => (
                    <div
                      key={product.productId}
                      className="p-3 hover:bg-slate-50 cursor-pointer border-b last:border-b-0"
                      onClick={() => {
                        setSelectedProduct(product);
                        setSearchProduct(product.brand.brandName);
                      }}
                    >
                      <p className="font-medium">{product.brand.brandName}</p>
                      <p className="text-sm text-slate-500">{product.productName}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <Button onClick={() => {
              if (selectedProduct) {
                addFeaturedProduct(selectedProduct.productId);
                setSelectedProduct(null);
                setSearchProduct('');
              }
            }} size="sm" className="shrink-0" disabled={!selectedProduct}>
              <Plus className="w-4 h-4 mr-1" />
              Add
            </Button>
          </div>

          <div className="space-y-2">
            {featuredProducts.length === 0 ? (
              <p className="text-sm text-slate-500 text-center py-4">No featured products yet</p>
            ) : (
              featuredProducts.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-3 bg-slate-50 rounded-lg"
                >
                  <div>
                    <p className="font-medium">Product ID: {item.product_id}</p>
                    <p className="text-sm text-slate-500">Order: {item.display_order}</p>
                  </div>
                  <Button
                    onClick={() => removeFeaturedProduct(item.id)}
                    variant="ghost"
                    size="sm"
                    className="text-rose-600 hover:text-rose-700 hover:bg-rose-50"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Heart className="w-5 h-5 text-rose-600" />
            <CardTitle>Featured Nonprofits</CardTitle>
          </div>
          <CardDescription>
            Manage which nonprofits appear in the featured section on homepage and charities page
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Input
                type="text"
                placeholder="Search nonprofits by name"
                value={searchNonprofit}
                onChange={(e) => setSearchNonprofit(e.target.value)}
              />
              {searchNonprofit && filteredNonprofits.length > 
