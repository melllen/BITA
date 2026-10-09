import { useForm } from 'react-hook-form';
import { useAuth } from '../../hooks/useAuth.js';
import { useNavigate } from 'react-router-dom';

export default function LoginForm({ onSwitchToSignup }) {
  const { login, loginError } = useAuth();
  const navigate = useNavigate();
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm();

  const onSubmit = async (data) => {
    await login(data);
    navigate('/');
  };

  return (
    <form className="auth-form" onSubmit={handleSubmit(onSubmit)}>
      <h2>Welcome back</h2>

      <label>Email
        <input type="email" {...register('email', { required: 'Required' })} />
        {errors.email && <span className="field-error">{errors.email.message}</span>}
      </label>

      <label>Password
        <input type="password" {...register('password', { required: 'Required' })} />
        {errors.password && <span className="field-error">{errors.password.message}</span>}
      </label>

      {loginError && (
        <p className="form-error">
          {typeof loginError.response?.data?.error === 'string'
            ? loginError.response.data.error
            : 'Login failed'}
        </p>
      )}

      <button type="submit" disabled={isSubmitting} className="btn-primary">
        {isSubmitting ? 'Signing in…' : 'Sign in'}
      </button>

      <p className="auth-switch">
        No account? <button type="button" onClick={onSwitchToSignup} className="link-btn">Sign up</button>
      </p>
    </form>
  );
}
