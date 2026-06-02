import { NextRequest, NextResponse } from 'next/server';

import { createAdminClient } from '@/lib/supabase';
import { normalizeEvent } from '@/lib/event-utils';

type RouteParams = {
  params: Promise<{
    slug: string;
  }>;
};

export async function GET(
  req: NextRequest,
  { params }: RouteParams
): Promise<NextResponse> {
  try {
    const supabase = createAdminClient();
    const { slug } = await params;

    if (!slug || typeof slug !== 'string' || slug.trim() === '') {
      return NextResponse.json(
        { message: 'Invalid or missing slug parameter' },
        { status: 400 }
      );
    }

    const sanitizedSlug = slug.trim().toLowerCase();

    const { data: event, error } = await supabase
      .from('events')
      .select('*')
      .eq('slug', sanitizedSlug)
      .single();

    if (error || !event) {
      return NextResponse.json(
        { message: `Event with slug '${sanitizedSlug}' not found` },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { message: 'Event fetched successfully', event: normalizeEvent(event) },
      { status: 200 }
    );
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('Error fetching event by slug:', error);
    }

    if (error instanceof Error) {
      if (error.message.includes('SUPABASE')) {
        return NextResponse.json(
          { message: 'Database configuration error' },
          { status: 500 }
        );
      }

      return NextResponse.json(
        { message: 'Failed to fetch event', error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { message: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}
