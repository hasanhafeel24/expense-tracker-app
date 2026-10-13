import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import useAuthStore from '../store/authStore';
import toast from 'react-hot-toast';
import { Eye, EyeOff, TrendingUp } from 'lucide-react';

const schema = z.object({
  email: z.string().email('Enter a valid email'),
  password: z.string().min(1, 'Password is required'),
});

export default function Login() {
  const [showPw, setShowPw] = useState(false);
  const { login } = useAuthStore();
  const navigate = useNavigate();

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({ resolver: zodResolver(schema) });

  const onSubmit = async (data) => {
    const result = await login(data);
    if (result.success) {
      toast.success('Welcome back!');
      navigate('/dashboard');
    } else {
      toast.error(result.message || 'Login failed');
    }
  };

  return (
    <div className="auth-page">
      {/* Background glows */}
      <div className="auth-bg-glow" style={{ width: 400, height: 400, background: 'var(--teal)', top: -100, left: -100 }} />
      <div className="auth-bg-glow" style={{ width: 300, height: 300, background: 'var(--purple)', bottom: -50, right: -50 }} />

      <div className="auth-card slide-up">
        <div className="auth-logo">
          <div className="auth-logo-icon"><TrendingUp size={22} color="white" /></div>
          <span className="auth-logo-text">Fintrack</span>
        </div>

        <h1 className="auth-title">Welcome back</h1>
        <p className="auth-subtitle">Sign in to manage your finances</p>

        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="form-group">
            <label className="form-label">Email Address</label>
            <input
              className={`form-control ${errors.email ? 'error' : ''}`}
              type="email" placeholder="you@example.com"
              {...register('email')}
            />
            {errors.email && <span className="form-error">{errors.email.message}</span>}
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <div style={{ position: 'relative' }}>
              <input
                className={`form-control ${errors.password ? 'error' : ''}`}
                type={showPw ? 'text' : 'password'}
                placeholder="••••••••"
                style={{ paddingRight: '42px' }}
                {...register('password')}
              />
              <button
                type="button" onClick={() => setShowPw(!showPw)}
                style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}
              >
                {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {errors.password && <span className="form-error">{errors.password.message}</span>}
          </div>

          <button
            type="submit"
            className="btn btn-primary btn-lg w-full"
            disabled={isSubmitting}
            style={{ marginTop: '8px' }}
          >
            {isSubmitting ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <p className="auth-divider" style={{ marginTop: '24px' }}>
          Don't have an account?{' '}
          <Link to="/register" className="auth-link">Create account</Link>
        </p>
      </div>
    </div>
  );
}
