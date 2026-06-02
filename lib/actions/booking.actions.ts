'use server';

import { revalidatePath } from 'next/cache';

import { createAdminClient } from '@/lib/supabase';
import { createRecordMetadata } from '@/lib/event-utils';

export const createBooking = async ({
  eventId,
  slug,
  email,
}: {
  eventId: string;
  slug: string;
  email: string;
}) => {
  try {
    const supabase = createAdminClient();
    const normalizedEmail = email.trim().toLowerCase();

    if (!normalizedEmail) {
      return { success: false, message: 'Email is required.' };
    }

    const { error } = await supabase.from('booking').insert({
      ...createRecordMetadata(),
      event_id: eventId,
      email: normalizedEmail,
    });

    if (error) {
      console.error('create booking failed', error);

      if (error.code === '23505') {
        return { success: false, message: 'You have already booked this event.' };
      }

      return { success: false, message: 'Booking failed. Please try again.' };
    }

    revalidatePath(`/events/${slug}`);

    return { success: true };
  } catch (e) {
    console.error('create booking failed', e);
    return { success: false, message: 'Booking failed. Please try again.' };
  }
};

export const getBookingCount = async (eventId: string): Promise<number> => {
  try {
    const supabase = createAdminClient();
    const { count, error } = await supabase
      .from('booking')
      .select('*', { count: 'exact', head: true })
      .eq('event_id', eventId);

    if (error) {
      return 0;
    }

    return count ?? 0;
  } catch {
    return 0;
  }
};
