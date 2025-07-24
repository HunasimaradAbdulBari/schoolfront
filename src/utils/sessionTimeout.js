// src/utils/sessionTimeout.js
import { useEffect } from 'react';

const useSessionTimeout = (timeoutMinutes = 40) => {
  useEffect(() => {
    const logout = () => {
      localStorage.clear();
      window.location.href = '/login';
    };

    let logoutTimer = setTimeout(logout, timeoutMinutes * 60 * 1000);

    const resetTimer = () => {
      clearTimeout(logoutTimer);
      logoutTimer = setTimeout(logout, timeoutMinutes * 60 * 1000);
    };

    const events = ['click', 'mousemove', 'keydown', 'scroll'];
    events.forEach((event) => window.addEventListener(event, resetTimer));

    return () => {
      clearTimeout(logoutTimer);
      events.forEach((event) => window.removeEventListener(event, resetTimer));
    };
  }, [timeoutMinutes]);
};

export default useSessionTimeout;