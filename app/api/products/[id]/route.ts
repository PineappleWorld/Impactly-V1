import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { reloadlyService } from '@/lib/reloadly';

export const dynamic = 'force-dynamic';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const productId = parseInt(params.id);

    if (isNaN(productId)) {
      return NextResponse.json(
        { error: 'Invalid product ID' },
        { status: 400 }
      );
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    const { data: product, error } = await supabase
      .from('marketplace_products')
      .select('*')
      .eq('reloadly_product_id', productId)
      .eq('is_visible', true)
      .maybeSingle();

    if (error) throw error;

    if (product) {
      return NextResponse.json(product);
    }

    try {
      const reloadlyProduct = await reloadlyService.getProductById(productId);
      return NextResponse.json({
        productId: reloadlyProduct.productId,
        productName: reloadlyProduct.productName,
        countryCode: reloadlyProduct.countryCode,
        logoUrls: reloadlyProduct.logoUrls || [],
        brand: {
          brandName: reloadlyProduct.brand.brandName,
        },
        fixedRecipientDenominations: reloadlyProduct.fixedRecipientDenominations || [],
        recipientCurrencyCode: reloadlyProduct.recipientCurrencyCode,
      });
    } catch (apiError) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }
  } catch (error: any) {
    console.error('Product fetch error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch product' },
      { status: 500 }
    );
  }
}