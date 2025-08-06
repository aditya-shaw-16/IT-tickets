import { useEffect, useState } from 'react';
import Sidebar from '../components/Sidebar';
import { toast } from 'react-toastify';

function AdminEscalationConfig() {
  const [formData, setFormData] = useState({
    itLeadName: '',
    itLeadEmail: '',
    managerName: '',
    managerEmail: '',
  });

  useEffect(() => {
    const fetchContacts = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch(`${import.meta.env.VITE_API_URL}/api/contacts`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
        if (res.ok) {
          const data = await res.json();
          // Ensure all values are non-null and non-undefined
          setFormData({
            itLeadName: data.itTeamLeadName || '',
            itLeadEmail: data.itTeamLeadEmail || '',
            managerName: data.managerName || '',
            managerEmail: data.managerEmail || '',
          });
        }
      } catch (err) {
        console.error("Error fetching contact info:", err);
        toast.error("Failed to load contact details");
      }
    };
    fetchContacts();
  }, []);

  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    toast.info("Saving contacts...");
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/contacts`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        toast.success("Escalation contacts saved successfully!");
      } else {
        const err = await res.json();
        toast.error('Failed: ' + (err.message || 'Unknown error'));
      }
    } catch (err) {
      console.error("Error saving contacts:", err);
      toast.error("Something went wrong while saving.");
    }
  };

  return (
    <div style={{ display: 'flex' }}>
      <Sidebar />
      <div style={{ flex: 1, padding: '2rem' }}>
        <h2 style={{ marginBottom: '1.5rem' }}>Escalation Contact Configuration</h2>
        <form onSubmit={handleSubmit} style={{ maxWidth: '500px' }}>
          <div style={{ marginBottom: '1rem' }}>
            <label style={labelStyle}>IT Team Lead Name:</label>
            <input
              type="text"
              name="itLeadName"
              value={formData.itLeadName}
              onChange={handleChange}
              style={inputStyle}
              required
            />
          </div>

          <div style={{ marginBottom: '1rem' }}>
            <label style={labelStyle}>IT Team Lead Email:</label>
            <input
              type="email"
              name="itLeadEmail"
              value={formData.itLeadEmail}
              onChange={handleChange}
              style={inputStyle}
              required
            />
          </div>

          <div style={{ marginBottom: '1rem' }}>
            <label style={labelStyle}>Reporting Manager Name:</label>
            <input
              type="text"
              name="managerName"
              value={formData.managerName}
              onChange={handleChange}
              style={inputStyle}
              required
            />
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <label style={labelStyle}>Reporting Manager Email:</label>
            <input
              type="email"
              name="managerEmail"
              value={formData.managerEmail}
              onChange={handleChange}
              style={inputStyle}
              required
            />
          </div>

          <button type="submit" style={buttonStyle}>💾 Save Contacts</button>
        </form>
      </div>
    </div>
  );
}

const labelStyle = {
  display: 'block',
  marginBottom: '0.3rem',
  fontWeight: 'bold',
};

const inputStyle = {
  width: '100%',
  padding: '0.5rem',
  fontSize: '1rem',
  borderRadius: '4px',
  border: '1px solid #ccc',
};

const buttonStyle = {
  padding: '0.6rem 1.2rem',
  backgroundColor: '#007bff',
  color: '#fff',
  border: 'none',
  borderRadius: '5px',
  cursor: 'pointer',
};

export default AdminEscalationConfig;
