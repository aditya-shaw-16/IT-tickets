import { useState } from 'react';
import { toast } from 'react-toastify';

function ChangePassword() {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleChangePassword = async (e) => {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      toast.error("New passwords don't match");
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${import.meta.env.VITE_API_URL}/auth/changePassword`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ currentPassword, newPassword })
      });

      const data = await res.json();

      if (res.ok) {
        toast.success('✅ Password changed successfully');
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      } else {
        toast.error(data.error || '❌ Failed to change password');
      }
    } catch (err) {
      console.error('Error changing password:', err);
      toast.error('⚠️ Something went wrong');
    }
  };

  return (
    <div style={{ maxWidth: '500px', margin: 'auto', padding: '2rem' }}>
      <h2>Change Password</h2>
      <form onSubmit={handleChangePassword}>
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
        <div>
          <label>New Password</label><br />
          <input
            type="password"
            value={newPassword}
            required
            onChange={(e) => setNewPassword(e.target.value)}
            style={{ width: '100%', padding: '8px', marginBottom: '1rem' }}
          />
        </div>
        <div>
          <label>Confirm New Password</label><br />
          <input
            type="password"
            value={confirmPassword}
            required
            onChange={(e) => setConfirmPassword(e.target.value)}
            style={{ width: '100%', padding: '8px', marginBottom: '1rem' }}
          />
          <p style={{ marginTop: '0.5rem' }}>
  <a href="/forgotPassword" style={{ color: '#007bff', textDecoration: 'none' }}>
    Forgot Password?
  </a>
</p>

        </div>
        <button type="submit" style={{ padding: '10px 20px' }}>
          Update Password
        </button>
      </form>
    </div>
  );
}

export default ChangePassword;
