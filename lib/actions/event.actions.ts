'use server';

import { createAdminClient } from '@/lib/supabase';
import { normalizeEvent } from '@/lib/event-utils';
import type { IEvent } from '@/database';

export const getSimilarEventsBySlug = async (slug: string): Promise<IEvent[]> => {
  try {
    const supabase = createAdminClient();
    const { data: event, error: eventError } = await supabase
      .from('events')
      .select('*')
      .eq('slug', slug)
      .single();

    if (eventError || !event) {
      return [];
    }

    const normalizedEvent = normalizeEvent(event);
    const { data: similarEvents, error: similarError } = await supabase
      .from('events')
      .select('*')
      .neq('id', event.id)
      .overlaps('tags', normalizedEvent.tags);

    if (similarError) {
      return [];
    }

    return (similarEvents ?? []).map((item) => normalizeEvent(item) as IEvent);
  } catch {
    return [];
  }
};
