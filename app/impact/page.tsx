'use client';

import { useEffect, useState } from 'react';
import { SharedHeader } from '@/components/shared-header';
import { SharedFooter } from '@/components/shared-footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, Heart, TrendingUp, Coins, Search, X } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { createClient } from '@/lib/supabase';
import Link from 'next/link';

type Purchase = {
  id: string;
  product_name: string;
  purchase_amount: number;
  profit_amount: number;
  charity_split_amount: number;
  pact_credits_earned: number;
  purchase_date: string;
};

type CharityContribution = {
  nonprofit_slug: string;
  nonprofit_name: string;
  amount: number;
};

type CharityPreference = {
  id: string;
  nonprofit_slug: string;
  nonprofit_name: string;
  priority_order: number;
};

type NonprofitOption = {
  nonprofit_slug: string;
  name: string;
  category: string;
};

export default function ImpactPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [contributions, setContributions] = useState<CharityContribution[]>([]);
  const [pactBalance, setPactBalance] = useState(0);
  const [lifetimeEarned, setLifetimeEarned] = useState(0);
  const [charityPreferences, setCharityPreferences] = useState<CharityPreference[]>([]);
  const [availableNonprofits, setAvailableNonprofits] = useState<NonprofitOption[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);

  useEffect(() => {
    if (user) {
      fetchUserImpactData();
      fetchCharityPreferences();
      fetchAvailableNonprofits();
    } else {
      setLoading(false);
    }
  }, [user]);

  const fetchUserImpactData = async () => {
    const supabase = createClient();

    const [purchasesRes, creditsRes, treasuryRes] = await Promise.all([
      supabase
        .from('user_purchases')
        .select('*')
        .eq('user_id', user!.id)
        .order('purchase_date', { ascending: false }),

      supabase
        .from('user_pact_credits')
        .select('*')
        .eq('user_id', user!.id)
        .maybeSingle(),

      supabase
        .from('charity_treasury')
        .select('*, nonprofits_cache!inner(name)')
        .eq('user_id', user!.id)
    ]);

    if (purchasesRes.data) {
      setPurchases(purchasesRes.data);
    }

    if (creditsRes.data) {
      setPactBalance(creditsRes.data.balance || 0);
      setLifetimeEarned(creditsRes.data.lifetime_earned || 0);
    }

    if (treasuryRes.data) {
      const aggregated = treasuryRes.data.reduce((acc: any, curr: any) => {
        const existing = acc.find((item: any) => item.nonprofit_slug === curr.nonprofit_slug);
        if (existing) {
          existing.amount += parseFloat(curr.amount);
        } else {
          acc.push({
            nonprofit_slug: curr.nonprofit_slug,
            nonprofit_name: curr.nonprofits_cache?.name || 'Unknown',
            amount: parseFloat(curr.amount),
          });
        }
        return acc;
      }, []);
      setContributions(aggregated);
    }

    setLoading(false);
  };

  const fetchCharityPreferences = async () => {
    const supabase = createClient();
    const { data } = await supabase
      .from('user_charity_preferences')
      .select('*, nonprofits_cache!inner(name)')
      .eq('user_id', user!.id)
      .order('priority_order');

    if (data) {
      setCharityPreferences(
        data.map((pref: any) => ({
          id: pref.id,
          nonprofit_slug: pref.nonprofit_slug,
          nonprofit_name: pref.nonprofits_cache?.name || 'Unknown',
          priority_order: pref.priority_order,
        }))
      );
    }
  };

  const fetchAvailableNonprofits = async () => {
    const supabase = createClient();
    const { data } = await supabase
      .from('nonprofits_cache')
      .select('nonprofit_slug, name, category')
      .limit(100);

    if (data) {
      setAvailableNonprofits(data);
    }
  };

  const addCharityPreference = async (nonprofit: NonprofitOption) => {
    const supabase = createClient();
    const newOrder = charityPreferences.length + 1;

    const { error } = await supabase
      .from('user_charity_preferences')
      .insert({
        user_id: user!.id,
        nonprofit_slug: nonprofit.nonprofit_slug,
        priority_order: newOrder,
      });

    if (!error) {
      await fetchCharityPreferences();
      setSearchQuery('');
      setShowSearch(false);
    }
  };

  const removeCharityPreference = async (id: string) => {
    const supabase = createClient();
    const { error } = await supabase
      .from('user_charity_preferences')
      .delete()
      .eq('id', id);

    if (!error) {
      await fetchCharityPreferences();
    }
  };

  const totalPurchases = purchases.reduce((sum, p) => sum + parseFloat(p.purchase_amount.toString()), 0);
  const totalProfit = purchases.reduce((sum, p) => sum + parseFloat(p.profit_amount.toString()), 0);
  const totalCharitySplit = purchases.reduce((sum, p) => sum + parseFloat(p.charity_split_amount.toString()), 0);

  const filteredNonprofits = availableNonprofits.filter(
    (np) =>
      !charityPreferences.some((pref) => pref.nonprofit_slug === np.nonprofit_slug) &&
      np.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-rose-50/30 to-amber-50/40">
        <SharedHeader />
        <main className="max-w-7xl mx-auto px-6 py-20">
          <div className="text-center">
            <h1 className="text-5xl font-bold text-slate-900 mb-6">Your Impact Dashboard</h1>
            <p className="text-xl text-slate-600 mb-8">
              Sign in to track your purchases, Impact Credits, and make a difference
            </p>
            <Link href="/auth">
              <Button size="lg" className="rounded-full px-10 py-6 text-lg">
                Sign In
              </Button>
            </Link>
          </div>
        </main>
        <SharedFooter />
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-rose-50/30 to-amber-50/40">
        <SharedHeader />
        <main className="max-w-7xl mx-auto px-6 py-20 flex items-center justify-center">
          <Loader2 className="w-12 h-12 animate-spin text-emerald-600" />
        </main>
        <SharedFooter />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-rose-50/30 to-amber-50/40">
      <SharedHeader />

      <main className="max-w-7xl mx-auto px-6 py-12">
        <div className="mb-12">
          <h1 className="text-5xl md:text-6xl font-bold text-slate-900 mb-4">
            Hi, {user.email?.split('@')[0]}!
          </h1>
          <p className="text-2xl text-slate-600">
            Here's your impact journey so far
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <Card className="bg-white/90 backdrop-blur border-emerald-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-emerald-700">
                <TrendingUp className="w-6 h-6" />
                <span className="text-lg">Total Purchases</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-4xl font-bold text-slate-900">${totalPurchases.toFixed(2)}</p>
              <p className="text-base text-slate-600 mt-2">{purchases.length} transactions</p>
            </CardContent>
          </Card>

          <Card className="bg-white/90 backdrop-blur border-blue-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-blue-700">
                <Heart className="w-6 h-6" />
                <span className="text-lg">Charity Pool</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-4xl font-bold text-slate-900">${totalCharitySplit.toFixed(2)}</p>
              <p className="text-base text-slate-600 mt-2">50% of ${totalProfit.toFixed(2)} profit</p>
            </CardContent>
          </Card>

          <Card className="bg-white/90 backdrop-blur border-amber-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-amber-700">
                <Coins className="w-6 h-6" />
                <span className="text-lg">PACT Credits</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-4xl font-bold text-slate-900">{pactBalance.toLocaleString()}</p>
              <p className="text-base text-slate-600 mt-2">Lifetime: {lifetimeEarned.toLocaleString()}</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid md:grid-cols-2 gap-8 mb-12">
          <Card className="bg-white/90 backdrop-blur">
            <CardHeader>
              <CardTitle className="text-2xl font-bold text-slate-900">Purchase History</CardTitle>
            </CardHeader>
            <CardContent>
              {purchases.length === 0 ? (
                <p className="text-lg text-slate-600 text-center py-8">No purchases yet. Start shopping to make an impact!</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="border-b border-slate-200">
                        <th className="pb-3 text-base font-semibold text-slate-900">Product</th>
                        <th className="pb-3 text-base font-semibold text-slate-900">Amount</th>
                        <th className="pb-3 text-base font-semibold text-slate-900">To Charity</th>
                        <th className="pb-3 text-base font-semibold text-slate-900">PACT</th>
                      </tr>
                    </thead>
                    <tbody>
                      {purchases.map((purchase) => (
                        <tr key={purchase.id} className="border-b border-slate-100">
                          <td className="py-4 text-base text-slate-700">{purchase.product_name}</td>
                          <td className="py-4 text-base text-slate-900 font-medium">${parseFloat(purchase.purchase_amount.toString()).toFixed(2)}</td>
                          <td className="py-4 text-base text-emerald-600 font-medium">${parseFloat(purchase.charity_split_amount.toString()).toFixed(2)}</td>
                          <td className="py-4 text-base text-amber-600 font-medium">{purchase.pact_credits_earned}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="bg-white/90 backdrop-blur">
            <CardHeader>
              <CardTitle className="text-2xl font-bold text-slate-900">Charity Contributions</CardTitle>
            </CardHeader>
            <CardContent>
              {contributions.length === 0 ? (
                <p className="text-lg text-slate-600 text-center py-8">No contributions yet. Set your charity preferences below!</p>
              ) : (
                <div className="space-y-4">
                  {contributions.map((contrib) => (
                    <div key={contrib.nonprofit_slug} className="flex justify-between items-center p-4 bg-slate-50 rounded-lg">
                      <div>
                        <p className="font-semibold text-base text-slate-900">{contrib.nonprofit_name}</p>
                        <p className="text-sm text-slate-600">Your contribution</p>
                      </div>
                      <p className="text-2xl font-bold text-emerald-600">${contrib.amount.toFixed(2)}</p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <Card className="bg-white/90 backdrop-blur">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-slate-900">Your Charity Preferences</CardTitle>
            <p className="text-base text-slate-600 mt-2">
              Choose organizations to support. Profits are split equally among your selected charities.
            </p>
          </CardHeader>
          <CardContent>
            {charityPreferences.length > 0 && (
              <div className="mb-6 space-y-3">
                {charityPreferences.map((pref, index) => (
                  <div key={pref.id} className="flex items-center justify-between p-4 bg-emerald-50 rounded-lg border border-emerald-200">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-lg">
                        {index + 1}
                      </div>
                      <p className="font-semibold text-lg text-slate-900">{pref.nonprofit_name}</p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeCharityPreference(pref.id)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <X className="w-5 h-5" />
                    </Button>
                  </div>
                ))}
              </div>
            )}

            {!showSearch ? (
              <Button
                onClick={() => setShowSearch(true)}
                className="w-full py-6 text-lg rounded-full"
              >
                <Search className="w-5 h-5 mr-2" />
                Add Charity
              </Button>
            ) : (
              <div className="space-y-4">
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Search for a nonprofit..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="flex-1 px-4 py-3 border border-slate-300 rounded-lg text-base focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                  <Button variant="outline" onClick={() => { setShowSearch(false); setSearchQuery(''); }}>
                    Cancel
                  </Button>
                </div>

                <div className="max-h-96 overflow-y-auto space-y-2">
                  {filteredNonprofits.slice(0, 20).map((nonprofit) => (
                    <button
                      key={nonprofit.nonprofit_slug}
                      onClick={() => addCharityPreference(nonprofit)}
                      className="w-full text-left p-4 bg-slate-50 hover:bg-slate-100 rounded-lg transition-colors"
                    >
                      <p className="font-semibold text-base text-slate-900">{nonprofit.name}</p>
                      <p className="text-sm text-slate-600">{nonprofit.category}</p>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="mt-12 p-8 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-2xl border border-emerald-200">
          <h3 className="text-2xl font-bold text-slate-900 mb-3">About Impact Credits (PACT)</h3>
          <p className="text-lg text-slate-700 leading-relaxed">
            <strong>100 PACT = $1</strong>. Earn PACT credits with every purchase. These credits accumulate in your wallet
            and will be redeemable for crypto tokens in the future. Your current balance represents your commitment to making
            a positive impact in the world.
          </p>
        </div>
      </main>

      <SharedFooter />
    </div>
  );
}
