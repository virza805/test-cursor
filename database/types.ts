export interface IEvent {
  id: string;
  title: string;
  slug: string;
  description: string;
  overview: string;
  image: string;
  venue: string;
  location: string;
  date: string;
  time: string;
  mode: 'online' | 'offline' | 'hybrid';
  audience: string;
  agenda: string[];
  organizer: string;
  tags: string[];
  created_at: string;
  updated_at: string;
}

export interface IBooking {
  id: string;
  event_id: string;
  email: string;
  created_at: string;
  updated_at: string;
}
