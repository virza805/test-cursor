'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

const CreateEventForm = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const form = e.currentTarget;
    const formData = new FormData(form);

    const tags = String(formData.get('tags') ?? '')
      .split(',')
      .map((tag) => tag.trim())
      .filter(Boolean);

    const agenda = String(formData.get('agenda') ?? '')
      .split('\n')
      .map((item) => item.trim())
      .filter(Boolean);

    if (tags.length === 0) {
      setError('Add at least one tag.');
      setLoading(false);
      return;
    }

    if (agenda.length === 0) {
      setError('Add at least one agenda item.');
      setLoading(false);
      return;
    }

    formData.set('tags', JSON.stringify(tags));
    formData.set('agenda', JSON.stringify(agenda));

    try {
      const response = await fetch('/api/events', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (!response.ok) {
        setError(result.error ?? result.message ?? 'Failed to create event.');
        setLoading(false);
        return;
      }

      router.push(`/events/${result.event.slug}`);
    } catch {
      setError('Failed to create event. Please try again.');
      setLoading(false);
    }
  };

  return (
    <form id="create-event" onSubmit={handleSubmit} className="space-y-6">
      <div className="grid gap-6 md:grid-cols-2">
        <div>
          <label htmlFor="title">Title</label>
          <input id="title" name="title" required placeholder="React Summit US 2025" />
        </div>

        <div>
          <label htmlFor="organizer">Organizer</label>
          <input id="organizer" name="organizer" required placeholder="DevEvent Team" />
        </div>

        <div className="md:col-span-2">
          <label htmlFor="description">Description</label>
          <textarea id="description" name="description" required rows={4} />
        </div>

        <div className="md:col-span-2">
          <label htmlFor="overview">Overview</label>
          <textarea id="overview" name="overview" required rows={3} />
        </div>

        <div>
          <label htmlFor="venue">Venue</label>
          <input id="venue" name="venue" required placeholder="Moscone Center" />
        </div>

        <div>
          <label htmlFor="location">Location</label>
          <input id="location" name="location" required placeholder="San Francisco, CA, USA" />
        </div>

        <div>
          <label htmlFor="date">Date</label>
          <input id="date" name="date" type="date" required />
        </div>

        <div>
          <label htmlFor="time">Time</label>
          <input id="time" name="time" type="time" required />
        </div>

        <div>
          <label htmlFor="mode">Mode</label>
          <select id="mode" name="mode" required defaultValue="offline">
            <option value="online">Online</option>
            <option value="offline">Offline</option>
            <option value="hybrid">Hybrid</option>
          </select>
        </div>

        <div>
          <label htmlFor="audience">Audience</label>
          <input id="audience" name="audience" required placeholder="Frontend developers" />
        </div>

        <div className="md:col-span-2">
          <label htmlFor="tags">Tags (comma separated)</label>
          <input id="tags" name="tags" required placeholder="React, Frontend, JavaScript" />
        </div>

        <div className="md:col-span-2">
          <label htmlFor="agenda">Agenda (one item per line)</label>
          <textarea
            id="agenda"
            name="agenda"
            required
            rows={5}
            placeholder={'Opening Keynote\nWorkshop Session\nPanel Discussion'}
          />
        </div>

        <div className="md:col-span-2">
          <label htmlFor="image">Event Image</label>
          <input id="image" name="image" type="file" accept="image/*" required />
        </div>
      </div>

      {error ? <p className="text-sm text-red-400">{error}</p> : null}

      <button type="submit" disabled={loading}>
        {loading ? 'Creating...' : 'Create Event'}
      </button>
    </form>
  );
};

export default CreateEventForm;
