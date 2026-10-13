import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import useAuthStore from '../store/authStore';
import toast from 'react-hot-toast';
import { Eye, EyeOff, TrendingUp } from 'lucide-react';

const schema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(50),
  email: z.string().email('Enter a valid email'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Must contain uppercase, lowercase, and a number'),
  confirmPassword: z.string(),
}).refine((d) => d.password === d.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

export default function Register() {
  const [showPw, setShowPw] = useState(false);
  const { register: registerUser } = useAuthStore();
  const navigate = useNavigate();

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({ resolver: zodResolver(schema) });

  const onSubmit = async ({ name, email, password }) => {
    const result = await registerUser({ name, email, password });
    if (result.success) {
      toast.success('Account created successfully!');
      navigate('/dashboard');
    } else {
      toast.error(result.message || 'Registration failed');
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-bg-glow" style={{ width: 400, height: 400, background: 'var(--purple)', top: -100, right: -100 }} />
      <div className="auth-bg-glow" style={{ width: 300, height: 300, background: 'var(--teal)', bottom: -50, left: -50 }} />

      <div className="auth-card slide-up">
        <div className="auth-logo">
          <div className="auth-logo-icon"><TrendingUp size={22} color="white" /></div>
          <span className="auth-logo-text">Fintrack</span>
        </div>

        <h1 className="auth-title">Create your account</h1>
        <p className="auth-subtitle">Start tracking your finances today</p>

        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="form-group">
            <label className="form-label">Full Name</label>
            <input
              className={`form-control ${errors.name ? 'error' : ''}`}
              placeholder="John Doe"
              {...register('name')}
            />
            {errors.name && <span className="form-error">{errors.name.message}</span>}
          </div>
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
                placeholder="Min. 8 chars with upper, lower & number"
                style={{ paddingRight: '42px' }}
                {...register('password')}
              />
              <button type="button" onClick={() => setShowPw(!showPw)}
                style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}>
                {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {errors.password && <span className="form-error">{errors.password.message}</span>}
          </div>
          <div className="form-group">
            <label className="form-label">Confirm Password</label>
            <input
              className={`form-control ${errors.confirmPassword ? 'error' : ''}`}
              type="password" placeholder="Repeat your password"
              {...register('confirmPassword')}
            />
            {errors.confirmPassword && <span className="form-error">{errors.confirmPassword.message}</span>}
          </div>

          <button type="submit" className="btn btn-primary btn-lg w-full" disabled={isSubmitting}>
            {isSubmitting ? 'Creating account...' : 'Create Account'}
          </button>
        </form>

        <p className="auth-divider" style={{ marginTop: '24px' }}>
          Already have an account?{' '}
          <Link to="/login" className="auth-link">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
