import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { supabase } from '@/lib/supabase';
import { getSetting } from '@/lib/settings';

export async function POST(req: NextRequest) {
  const body = await req.text();
  const signature = headers().get('stripe-signature');

  if (!signature) {
    return NextResponse.json(
      { error: 'No signature provided' },
      { status: 400 }
    );
  }

  try {
    const webhookSecret = await getSetting('stripe_webhook_secret');

    if (!webhookSecret) {
      console.error('Stripe webhook secret not configured');
      return NextResponse.json(
        { error: 'Webhook not configured' },
        { status: 500 }
      );
    }

    const stripe = require('stripe')(await getSetting('stripe_secret_key'));
    const event = stripe.webhooks.constructEvent(body, signature, webhookSecret);

    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object;

        const transactionIds = session.metadata?.transaction_ids;
        if (transactionIds) {
          const ids = transactionIds.split(',');
          
          // Update all transactions
          await supabase
            .from('transactions')
            .update({
              status: 'completed',
              stripe_payment_id: session.payment_intent
            })
            .in('id', ids);

          // Get transactions to create user_purchases entries
          const { data: allTransactions } = await supabase
            .from('transactions')
            .select('*')
            .in('id', ids);

          if (allTransactions && allTransactions.length > 0) {
            const userId = allTransactions[0].user_id;
            
            // Create user_purchases entries
            const userPurchases = allTransactions.map(t => ({
              user_id: userId,
              product_id: t.reloadly_order_id || t.id,
              product_name: t.product_name,
              purchase_amount: t.purchase_price,
              profit_amount: t.profit_amount,
              charity_split_amount: t.charity_share,
              pact_credits_earned: t.impact_tickets_earned,
              purchase_date: new Date().toISOString(),
            }));

            await supabase
              .from('user_purchases')
              .insert(userPurchases);

            // Sum up all tickets and charity shares for this session
            const totalTickets = allTransactions.reduce((sum, t) => sum + (t.impact_tickets_earned || 0), 0);
            const totalCharity = allTransactions.reduce((sum, t) => sum + (parseFloat(t.charity_share as any) || 0), 0);

            // Update user profile stats
            await supabase.rpc('increment_profile_stats', {
              p_user_id: userId,
              p_tickets: totalTickets,
              p_impact: totalCharity
            });

            // Initialize user_pact_credits if doesn't exist
            const { data: existingCredits } = await supabase
              .from('user_pact_credits')
              .select('id')
              .eq('user_id', userId)
              .maybeSingle();

            if (!existingCredits) {
              await supabase
                .from('user_pact_credits')
                .insert({
                  user_id: userId,
                  balance: totalTickets,
                  lifetime_earned: totalTickets,
                });
            }

            // Update user_pact_credits
            const { data: currentCredits } = await supabase
              .from('user_pact_credits')
              .select('balance, lifetime_earned')
              .eq('user_id', userId)
              .single();

            if (currentCredits) {
              await supabase
                .from('user_pact_credits')
                .update({
                  balance: (currentCredits.balance || 0) + totalTickets,
                  lifetime_earned: (currentCredits.lifetime_earned || 0) + totalTickets,
                  updated_at: new Date().toISOString(),
                })
                .eq('user_id', userId);
            }

            // Trigger gift card fulfillment asynchronously
            // In production, this should be a background job/queue
            try {
              const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
              fetch(`${baseUrl}/api/orders/process`, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({ transactionIds: ids }),
              }).catch(err => console.error('Failed to trigger fulfillment:', err));
            } catch (e) {
              console.error('Fulfillment trigger error:', e);
            }
          }
        }
        break;
      }

      case 'checkout.session.expired':
      case 'payment_intent.payment_failed': {
        const session = event.data.object;
        const transactionIds = session.metadata?.transaction_ids;

        if (transactionIds) {
          const ids = transactionIds.split(',');
          await supabase
            .from('transactions')
            .update({ status: 'failed' })
            .in('id', ids);
        }
        break;
      }
    }

    return NextResponse.json({ received: true });
  } catch (err: any) {
    console.error('Webhook error:', err.message);
    return NextResponse.json(
      { error: `Webhook Error: ${err.message}` },
      { status: 400 }
    );
  }
}
