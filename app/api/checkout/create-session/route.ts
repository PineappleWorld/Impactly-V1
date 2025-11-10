import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import Stripe from 'stripe';
import { reloadlyService } from '@/lib/reloadly';
import { getSetting } from '@/lib/settings';

export const dynamic = 'force-dynamic';

type CartItem = {
  productId: number;
  productName: string;
  brandName: string;
  denomination: number;
  currency: string;
  quantity: number;
};

export async function POST(req: NextRequest) {
  try {
    const { items, userId } = await req.json();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: 'Cart is empty' }, { status: 400 });
    }

    // Initialize Stripe
    const stripeSecretKey = await getSetting('stripe_secret_key');
    if (!stripeSecretKey) {
      return NextResponse.json({ error: 'Payment system not configured' }, { status: 500 });
    }

    const stripe = new Stripe(stripeSecretKey, {
      apiVersion: '2024-11-20.acacia',
    });

    // Initialize Supabase
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Calculate pricing for each item
    const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = [];
    const transactionData: any[] = [];

    for (const item of items as CartItem[]) {
      // Get product details from Reloadly
      const product = await reloadlyService.getProductById(item.productId);
      
      // Find the denomination in fixed denominations
      const denominationIndex = product.fixedRecipientDenominations.indexOf(item.denomination);
      if (denominationIndex === -1) {
        return NextResponse.json(
          { error: `Invalid denomination for ${item.brandName}` },
          { status: 400 }
        );
      }

      // Get the cost price (what we pay)
      const costPrice = product.fixedSenderDenominations[denominationIndex];
      
      // Calculate pricing
      const pricing = await reloadlyService.calculatePricing(costPrice, item.denomination);

      // Create line items for Stripe
      lineItems.push({
        price_data: {
          currency: 'usd',
          product_data: {
            name: `${item.brandName} Gift Card`,
            description: `${item.currency} ${item.denomination}`,
            images: product.logoUrls?.slice(0, 1) || [],
          },
          unit_amount: Math.round(pricing.purchasePrice * 100), // Convert to cents
        },
        quantity: item.quantity,
      });

      // Prepare transaction data (will be created after successful payment)
      for (let i = 0; i < item.quantity; i++) {
        transactionData.push({
          user_id: userId,
          product_name: item.productName,
          product_amount: item.denomination,
          purchase_price: pricing.purchasePrice,
          cost_price: costPrice,
          profit_amount: pricing.profit,
          company_share: pricing.companyShare,
          charity_share: pricing.charityShare,
          impact_tickets_earned: pricing.impactTickets,
          status: 'pending',
        });
      }
    }

    // Create pending transactions
    const { data: transactions, error: txError } = await supabase
      .from('transactions')
      .insert(transactionData)
      .select('id');

    if (txError) {
      console.error('Transaction creation error:', txError);
      return NextResponse.json({ error: 'Failed to create transactions' }, { status: 500 });
    }

    // Create Stripe Checkout Session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: lineItems,
      mode: 'payment',
      success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/checkout/cancel`,
      metadata: {
        user_id: userId,
        transaction_ids: transactions.map(t => t.id).join(','),
      },
      customer_email: undefined, // Will be filled by Stripe
    });

    return NextResponse.json({ sessionId: session.id, url: session.url });
  } catch (error: any) {
    console.error('Checkout error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create checkout session' },
      { status: 500 }
    );
  }
}
