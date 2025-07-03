

export const handleAuthError = (error) => {
  if (
    error?.response?.status === 401 ||
    error?.message === 'Invalid or expired token'
  ) {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login'; // redirect to login
  }
};
