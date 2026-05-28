import { useContext } from 'react';
import { AuthContext } from './useAuth';

export const useAuth = () => useContext(AuthContext);
