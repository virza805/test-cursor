'use server';

import { createAdminClient } from '@/lib/supabase';
import { normalizeEvent } from '@/lib/event-utils';
import type { IEvent } from '@/database';

export const getEvents = async (): Promise<IEvent[]> => {
  const supabase = createAdminClient();
  const { data: events, error } = await supabase
    .from('events')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return (events ?? []).map((event) => normalizeEvent(event) as IEvent);
};

export const getEventBySlug = async (slug: string): Promise<IEvent | null> => {
  if (!slug || typeof slug !== 'string' || slug.trim() === '') {
    return null;
  }

  const sanitizedSlug = slug.trim().toLowerCase();
  const supabase = createAdminClient();
  const { data: event, error } = await supabase
    .from('events')
    .select('*')
    .eq('slug', sanitizedSlug)
    .single();

  if (error || !event) {
    return null;
  }

  return normalizeEvent(event) as IEvent;
};

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
