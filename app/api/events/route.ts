import { mkdir, writeFile } from 'fs/promises';
import { NextRequest, NextResponse } from 'next/server';
import path from 'path';

import { createAdminClient } from '@/lib/supabase';
import {
  createRecordMetadata,
  generateSlug,
  normalizeDate,
  normalizeTime,
  normalizeEvent,
} from '@/lib/event-utils';

export async function POST(req: NextRequest) {
  try {
    const supabase = createAdminClient();
    const formData = await req.formData();

    let event: Record<string, FormDataEntryValue>;

    try {
      event = Object.fromEntries(formData.entries());
    } catch {
      return NextResponse.json({ message: 'Invalid JSON data format' }, { status: 400 });
    }

    const file = formData.get('image') as File;

    if (!file) {
      return NextResponse.json({ message: 'Image file is required' }, { status: 400 });
    }

    const tags = JSON.parse(formData.get('tags') as string) as string[];
    const agenda = JSON.parse(formData.get('agenda') as string) as string[];

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const fileName = `${Date.now()}-${file.name.replace(/\s+/g, '-')}`;

    const uploadDir = path.join(process.cwd(), 'public', 'images');
    await mkdir(uploadDir, { recursive: true });
    await writeFile(path.join(uploadDir, fileName), buffer);
    const imagePath = `/images/${fileName}`;

    const title = String(event.title);
    const slug = generateSlug(title);

    const { data: createdEvent, error: insertError } = await supabase
      .from('events')
      .insert({
        ...createRecordMetadata(),
        title,
        slug,
        description: String(event.description),
        overview: String(event.overview),
        image: imagePath,
        venue: String(event.venue),
        location: String(event.location),
        date: normalizeDate(String(event.date)),
        time: normalizeTime(String(event.time)),
        mode: String(event.mode),
        audience: String(event.audience),
        organizer: String(event.organizer),
        tags,
        agenda,
      })
      .select()
      .single();

    if (insertError) {
      console.error(insertError);

      if (insertError.code === '23505') {
        return NextResponse.json(
          { message: 'Event Creation Failed', error: 'An event with this title already exists.' },
          { status: 409 }
        );
      }

      return NextResponse.json(
        { message: 'Event Creation Failed', error: insertError.message },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        message: 'Event created successfully',
        event: normalizeEvent(createdEvent),
      },
      { status: 201 }
    );
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { message: 'Event Creation Failed', error: e instanceof Error ? e.message : 'Unknown' },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const supabase = createAdminClient();

    const { data: events, error } = await supabase
      .from('events')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      return NextResponse.json(
        { message: 'Event fetching failed', error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        message: 'Events fetched successfully',
        events: (events ?? []).map((event) => normalizeEvent(event)),
      },
      { status: 200 }
    );
  } catch (e) {
    return NextResponse.json(
      { message: 'Event fetching failed', error: e instanceof Error ? e.message : 'Unknown' },
      { status: 500 }
    );
  }
}
