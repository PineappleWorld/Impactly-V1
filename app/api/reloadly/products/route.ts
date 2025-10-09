import { NextResponse } from 'next/server';
import { reloadlyService } from '@/lib/reloadly';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const size = parseInt(searchParams.get('size') || '20');
    const country = searchParams.get('country');

    if (size > 200) {
      const allProducts = await reloadlyService.getAllProducts();
      const filteredProducts = country && country !== 'all'
        ? allProducts.filter(p => p.countryCode === country)
        : allProducts;

      return NextResponse.json({
        products: filteredProducts,
        total: filteredProducts.length,
        page: 1,
        size: filteredProducts.length,
      });
    }

    const page = parseInt(searchParams.get('page') || '1');
    const data = await reloadlyService.getProducts(page, size);

    const filteredProducts = country && country !== 'all'
      ? data.content.filter(p => p.countryCode === country)
      : data.content;

    return NextResponse.json({
      products: filteredProducts,
      total: filteredProducts.length,
      page,
      size,
    });
  } catch (error: any) {
    console.error('Gift Card API Error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch gift cards' },
      { status: 500 }
    );
  }
}
