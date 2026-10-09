import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getMe, login as apiLogin, signup as apiSignup, logout as apiLogout } from '../api/auth.js';

export function useAuth() {
  const qc = useQueryClient();

  const { data: user, isLoading } = useQuery({
    queryKey: ['me'],
    queryFn: getMe,
    retry: false,
    staleTime: Infinity,
  });

  const loginMutation = useMutation({
    mutationFn: apiLogin,
    onSuccess: (user) => qc.setQueryData(['me'], user),
  });

  const signupMutation = useMutation({
    mutationFn: apiSignup,
    onSuccess: (user) => qc.setQueryData(['me'], user),
  });

  const logoutMutation = useMutation({
    mutationFn: apiLogout,
    onSuccess: () => qc.setQueryData(['me'], null),
  });

  return {
    user: user ?? null,
    isLoading,
    login: loginMutation.mutateAsync,
    signup: signupMutation.mutateAsync,
    logout: logoutMutation.mutate,
    loginError: loginMutation.error,
    signupError: signupMutation.error,
  };
}
