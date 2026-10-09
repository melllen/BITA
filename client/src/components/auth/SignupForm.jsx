import { useForm } from 'react-hook-form';
import { useAuth } from '../../hooks/useAuth.js';
import { useNavigate } from 'react-router-dom';

export default function SignupForm({ onSwitchToLogin }) {
  const { signup, signupError } = useAuth();
  const navigate = useNavigate();
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm();

  const onSubmit = async (data) => {
    await signup(data);
    navigate('/');
  };

  return (
    <form className="auth-form" onSubmit={handleSubmit(onSubmit)}>
      <h2>Create account</h2>

      <label>Display name
        <input type="text" {...register('displayName')} placeholder="Optional" />
      </label>

      <label>Email
        <input type="email" {...register('email', { required: 'Required' })} />
        {errors.email && <span className="field-error">{errors.email.message}</span>}
      </label>

      <label>Password
        <input
          type="password"
          {...register('password', { required: 'Required', minLength: { value: 8, message: 'Min 8 characters' } })}
        />
        {errors.password && <span className="field-error">{errors.password.message}</span>}
      </label>

      {signupError && (
        <p className="form-error">
          {typeof signupError.response?.data?.error === 'string'
            ? signupError.response.data.error
            : 'Signup failed'}
        </p>
      )}

      <button type="submit" disabled={isSubmitting} className="btn-primary">
        {isSubmitting ? 'Creating account…' : 'Create account'}
      </button>

      <p className="auth-switch">
        Have an account? <button type="button" onClick={onSwitchToLogin} className="link-btn">Sign in</button>
      </p>
    </form>
  );
}
