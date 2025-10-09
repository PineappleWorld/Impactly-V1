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

export function FeaturedManager() {
  const [featuredProducts, setFeaturedProducts] = useState<FeaturedProduct[]>([]);
  const [featuredNonprofits, setFeaturedNonprofits] = useState<FeaturedNonprofit[]>([]);
  const [newProductId, setNewProductId] = useState('');
  const [newNonprofitSlug, setNewNonprofitSlug] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadFeatured();
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

  const addFeaturedProduct = async () => {
    if (!newProductId) return;

    try {
      const { error } = await supabase.from('featured_products').insert({
        product_id: parseInt(newProductId),
        display_order: featuredProducts.length,
      });

      if (error) throw error;

      setNewProductId('');
      loadFeatured();
    } catch (error) {
      console.error('Error adding featured product:', error);
    }
  };

  const addFeaturedNonprofit = async () => {
    if (!newNonprofitSlug) return;

    try {
      const { error } = await supabase.from('featured_nonprofits').insert({
        nonprofit_slug: newNonprofitSlug,
        display_order: featuredNonprofits.length,
      });

      if (error) throw error;

      setNewNonprofitSlug('');
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
            <Input
              type="number"
              placeholder="Enter Product ID"
              value={newProductId}
              onChange={(e) => setNewProductId(e.target.value)}
              className="flex-1"
            />
            <Button onClick={addFeaturedProduct} size="sm" className="shrink-0">
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
            <Input
              type="text"
              placeholder="Enter Nonprofit Slug"
              value={newNonprofitSlug}
              onChange={(e) => setNewNonprofitSlug(e.target.value)}
              className="flex-1"
            />
            <Button onClick={addFeaturedNonprofit} size="sm" className="shrink-0">
              <Plus className="w-4 h-4 mr-1" />
              Add
            </Button>
          </div>

          <div className="space-y-2">
            {featuredNonprofits.length === 0 ? (
              <p className="text-sm text-slate-500 text-center py-4">No featured nonprofits yet</p>
            ) : (
              featuredNonprofits.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-3 bg-slate-50 rounded-lg"
                >
                  <div>
                    <p className="font-medium">{item.nonprofit_slug}</p>
                    <p className="text-sm text-slate-500">Order: {item.display_order}</p>
                  </div>
                  <Button
                    onClick={() => removeFeaturedNonprofit(item.id)}
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
    </div>
  );
}
