import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { reloadlyService } from '@/lib/reloadly';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const { transactionIds } = await req.json();

    if (!transactionIds || !Array.isArray(transactionIds)) {
      return NextResponse.json({ error: 'Invalid transaction IDs' }, { status: 400 });
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Get transactions that need fulfillment
    const { data: transactions, error: txError } = await supabase
      .from('transactions')
      .select('*')
      .in('id', transactionIds)
      .eq('status', 'completed')
      .eq('fulfillment_status', 'pending');

    if (txError || !transactions || transactions.length === 0) {
      console.error('Transaction fetch error:', txError);
      return NextResponse.json({ 
        error: 'No transactions to fulfill',
        processed: 0 
      }, { status: 200 });
    }

    const results = [];
    
    for (const transaction of transactions) {
      try {
        // Get user email
        const { data: userData } = await supabase.auth.admin.getUserById(transaction.user_id);
        const recipientEmail = userData?.user?.email || '';

        if (!recipientEmail) {
          console.error('No email found for user:', transaction.user_id);
          results.push({
            transactionId: transaction.id,
            status: 'failed',
            error: 'No recipient email',
          });
          continue;
        }

        // For now, we'll use a mock/placeholder approach since actual Reloadly ordering
        // requires product ID and denomination mapping. In production, you'd:
        // 1. Store product_id in transaction
        // 2. Call reloadlyService.placeOrder()
        // 3. Store the gift card code returned
        
        // Mock gift card code (replace with actual Reloadly order)
        const mockGiftCardCode = `GIFT-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
        
        // Update transaction with gift card info
        await supabase
          .from('transactions')
          .update({
            gift_card_code: mockGiftCardCode,
            recipient_email: recipientEmail,
            fulfillment_status: 'fulfilled',
            fulfilled_at: new Date().toISOString(),
          })
          .eq('id', transaction.id);

        // Also update user_purchases
        await supabase
          .from('user_purchases')
          .update({
            gift_card_code: mockGiftCardCode,
            recipient_email: recipientEmail,
          })
          .eq('user_id', transaction.user_id)
          .eq('product_name', transaction.product_name)
          .is('gift_card_code', null);

        results.push({
          transactionId: transaction.id,
          status: 'fulfilled',
          giftCardCode: mockGiftCardCode,
        });
      } catch (error: any) {
        console.error('Order processing error:', error);
        results.push({
          transactionId: transaction.id,
          status: 'failed',
          error: error.message,
        });
      }
    }

    return NextResponse.json({
      processed: results.length,
      results,
    });
  } catch (error: any) {
    console.error('Order fulfillment error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to process orders' },
      { status: 500 }
    );
  }
}
