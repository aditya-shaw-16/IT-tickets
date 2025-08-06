import { useState } from 'react';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';

function RaiseEmployeeTicket() {
  const [employeeEmail, setEmployeeEmail] = useState('');
  const [employeeName, setEmployeeName] = useState('');
  const [employeePhone, setEmployeePhone] = useState('');
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);

  const navigate = useNavigate();

  const handleSendOtp = async () => {
    const token = localStorage.getItem('token');

    if (!employeePhone || employeePhone.length < 10) {
      toast.error('Enter a valid phone number');
      return;
    }

    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/tickets/raiseForEmployee`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          name: employeeName,
          email: employeeEmail,
          phone: employeePhone,
          subject,
          description
        })
      });

      const data = await res.json();
      if (res.ok) {
        setOtpSent(true);
        toast.success(data.message || 'OTP sent successfully');
      } else {
        toast.error(data.error || 'Failed to send OTP');
      }
    } catch (err) {
      console.error('Send OTP error:', err);
      toast.error('Error sending OTP');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');

    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/tickets/verifyOTP`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          email: employeeEmail,
          otp,
          subject,
          description
        })
      });

      const data = await res.json();
      if (res.ok) {
        toast.success('✅ Ticket raised successfully');
        navigate('/tickets');
      } else {
        toast.error(data.error || '❌ Failed to raise ticket');
      }
    } catch (err) {
      console.error('Raise ticket error:', err);
      toast.error('Error raising ticket');
    }
  };

  return (
    <div style={{ maxWidth: '600px', margin: 'auto', padding: '2rem' }}>
      <h2>Raise Ticket for Employee</h2>
      <form onSubmit={handleSubmit}>
        <label>Employee Name</label>
        <input
          type="text"
          value={employeeName}
          onChange={(e) => setEmployeeName(e.target.value)}
          required
          style={inputStyle}
        />

        <label>Employee Email</label>
        <input
          type="email"
          value={employeeEmail}
          onChange={(e) => setEmployeeEmail(e.target.value)}
          required
          style={inputStyle}
        />

        <label>Employee Phone</label>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <input
            type="tel"
            value={employeePhone}
            onChange={(e) => setEmployeePhone(e.target.value)}
            required
            style={{ ...inputStyle, flex: 1 }}
          />
          <button type="button" onClick={handleSendOtp}>
            Send OTP
          </button>
        </div>

        {otpSent && (
          <>
            <label>Enter OTP</label>
            <input
              type="text"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              required
              style={inputStyle}
            />
          </>
        )}

        <label>Ticket Subject</label>
        <input
          type="text"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          required
          style={inputStyle}
        />

        <label>Ticket Description</label>
        <textarea
          rows={4}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required
          style={{ ...inputStyle, resize: 'vertical' }}
        />

        <button type="submit" disabled={!otpSent}>
          Submit Ticket
        </button>
      </form>
    </div>
  );
}

const inputStyle = {
  width: '100%',
  padding: '8px',
  marginBottom: '1rem',
  borderRadius: '4px',
  border: '1px solid #ccc'
};

export default RaiseEmployeeTicket;
