import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function GET() {
  try {
    const { data, error } = await supabase
      .from('featured_nonprofits')
      .select('*')
      .eq('is_active', true)
      .order('display_order', { ascending: true });

    if (error) throw error;

    return NextResponse.json({ featured: data || [] });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to fetch featured nonprofits' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { nonprofit_slug, display_order = 0 } = body;

    if (!nonprofit_slug) {
      return NextResponse.json(
        { error: 'nonprofit_slug is required' },
        { status: 400 }
      );
    }

    const { data: authData } = await supabase.auth.getUser();

    if (!authData.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data, error } = await supabase
      .from('featured_nonprofits')
      .insert({
        nonprofit_slug,
        display_order,
        created_by: authData.user.id,
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ featured: data });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to create featured nonprofit' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'id is required' },
        { status: 400 }
      );
    }

    const { error } = await supabase
      .from('featured_nonprofits')
      .delete()
      .eq('id', id);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to delete featured nonprofit' },
      { status: 500 }
    );
  }
}
