function AlertBox({ type = 'info', message }) {
  const backgroundColors = {
    success: '#d4edda',
    error: '#f8d7da',
    info: '#cce5ff',
    warning: '#fff3cd'
  };

  return (
    <div style={{
      backgroundColor: backgroundColors[type] || '#cce5ff',
      borderLeft: `6px solid ${
        type === 'success' ? '#28a745' :
        type === 'error' ? '#dc3545' :
        type === 'warning' ? '#ffc107' :
        '#007bff'
      }`,
      padding: '1rem',
      marginBottom: '1rem',
      borderRadius: '5px'
    }}>
      {message}
    </div>
  );
}

export default AlertBox;
