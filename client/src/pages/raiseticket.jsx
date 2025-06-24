import { useState } from 'react';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function RaiseTicket() {
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();

    const token = localStorage.getItem('token');

    if (!token) {
      toast.error('User not authenticated.');
      return;
    }

    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/tickets`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ subject, description }),
      });

      const data = await res.json();

      if (res.ok) {
        toast.success('✅ Ticket submitted successfully!');
        setSubject('');
        setDescription('');
      } else {
        toast.error(data.error || '❌ Failed to submit ticket.');
      }
    } catch (error) {
      console.error('Submit Error:', error);
      toast.error('⚠️ Error occurred while submitting.');
    }
  };

  return (
    <div style={{ padding: '2rem', maxWidth: '600px', margin: 'auto' }}>
      <h2>Raise a Ticket</h2>

      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '1rem' }}>
          <label>Subject</label><br />
          <input
            type="text"
            required
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            style={{ width: '100%', padding: '8px' }}
          />
        </div>

        <div style={{ marginBottom: '1rem' }}>
          <label>Description</label><br />
          <textarea
            required
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            style={{ width: '100%', padding: '8px' }}
            rows="4"
          />
        </div>

        <button type="submit" style={{ padding: '10px 20px' }}>
          Submit Ticket
        </button>
      </form>
    </div>
  );
}

export default RaiseTicket;
