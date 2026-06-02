import CreateEventForm from '@/components/CreateEventForm';

const CreateEventPage = () => {
  return (
    <section id="create-event-page">
      <div className="header">
        <h1>Create Event</h1>
        <p className="subheading">Share your next developer event with the community.</p>
      </div>

      <CreateEventForm />
    </section>
  );
};

export default CreateEventPage;
