import { useState } from 'react';
import { toast } from 'react-toastify';

function ChangePhone() {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPhone, setNewPhone] = useState('');

  const handleChangePhone = async (e) => {
    e.preventDefault();

    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${import.meta.env.VITE_API_URL}/auth/changePhone`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ currentPassword, newPhone })
      });

      const data = await res.json();

      if (res.ok) {
        toast.success('✅ Phone number updated');
        setCurrentPassword('');
        setNewPhone('');
      } else {
        toast.error(data.error || '❌ Failed to update phone');
      }
    } catch (err) {
      console.error('Error updating phone:', err);
      toast.error('⚠️ Something went wrong');
    }
  };

  return (
    <div style={{ maxWidth: '500px', margin: 'auto', padding: '2rem' }}>
      <h2>Change Phone Number</h2>
      <form onSubmit={handleChangePhone}>
        <div>
          <label>New Phone Number</label><br />
          <input
            type="tel"
            value={newPhone}
            required
            onChange={(e) => setNewPhone(e.target.value)}
            style={{ width: '100%', padding: '8px', marginBottom: '1rem' }}
          />
        </div>
        <div>
          <label>Current Password</label><br />
          <input
            type="password"
            value={currentPassword}
            required
            onChange={(e) => setCurrentPassword(e.target.value)}
            style={{ width: '100%', padding: '8px', marginBottom: '1rem' }}
          />
        </div>
        <button type="submit" style={{ padding: '10px 20px' }}>
          Update Phone
        </button>
      </form>
    </div>
  );
}

export default ChangePhone;
