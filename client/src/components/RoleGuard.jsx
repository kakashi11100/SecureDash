import React from 'react';
import { useAuth } from '../hooks/useAuthHook';

export const RoleGuard = ({ allowedRoles, children, fallbackMode = false }) => {
  const { user } = useAuth();

  if (!user || !allowedRoles.includes(user.role)) {
    if (fallbackMode) {
      return (
        <div style={{ padding: '20px', border: '1px red dotted', color: 'red', marginTop: '10px' }}>
          🔒 Access Denied. This administrative block requires {allowedRoles.join(' or ')} permissions.
        </div>
      );
    }
    return null;
  }

  return <>{children}</>;
};
