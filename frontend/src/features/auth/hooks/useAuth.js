import { useSelector, useDispatch } from 'react-redux';
import { login, register, logout as logoutAction, setUser, clearError } from '../auth.slice';
import { getCurrentUser as fetchCurrentUserApi } from '../services/auth.api';

export const useAuth = () => {
  const dispatch = useDispatch();
  const authState = useSelector((state) => state.auth);

  const loginUser = (data) => {
    return dispatch(login(data));
  };

  const registerUser = (data) => {
    return dispatch(register(data));
  };

  const logout = () => {
    dispatch(logoutAction());
  };

  const fetchCurrentUser = async () => {
    try {
      if (authState.token) {
        const response = await fetchCurrentUserApi();
        dispatch(setUser(response.data.user));
      }
    } catch (error) {
      console.error('Failed to fetch current user', error);
      dispatch(logoutAction());
    }
  };

  const resetError = () => {
    dispatch(clearError());
  };

  return {
    ...authState,
    login: loginUser,
    register: registerUser,
    logout,
    fetchCurrentUser,
    resetError,
  };
};
