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

        const transactionId = session.metadata?.transaction_id;
        if (transactionId) {
          await supabase
            .from('transactions')
            .update({
              status: 'completed',
              stripe_payment_id: session.payment_intent
            })
            .eq('id', transactionId);

          const transaction = await supabase
            .from('transactions')
            .select('user_id, impact_tickets_earned, charity_share')
            .eq('id', transactionId)
            .single();

          if (transaction.data) {
            await supabase.rpc('increment_profile_stats', {
              p_user_id: transaction.data.user_id,
              p_tickets: transaction.data.impact_tickets_earned,
              p_impact: transaction.data.charity_share
            });
          }
        }
        break;
      }

      case 'checkout.session.expired':
      case 'payment_intent.payment_failed': {
        const session = event.data.object;
        const transactionId = session.metadata?.transaction_id;

        if (transactionId) {
          await supabase
            .from('transactions')
            .update({ status: 'failed' })
            .eq('id', transactionId);
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
