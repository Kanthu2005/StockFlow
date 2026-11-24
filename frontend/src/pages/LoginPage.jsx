import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';

export default function LoginPage() {
  const [email, setEmail] = useState('alex@stockflow.dev');
  const [password, setPassword] = useState('password123');
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const validate = () => {
    const newErrors = {};
    if (!email.trim()) {
      newErrors.email = 'Email address is required.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = 'Please enter a valid email address.';
    }

    if (!password) {
      newErrors.password = 'Password is required.';
    } else if (password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

    const handleSubmit = async (e) => {
      e.preventDefault();
      if (!validate()) return;

      setIsLoading(true);
        try {
          await login(email, password);
          navigate('/dashboard');
        } catch (err) {
          setErrors({ form: err.message || 'Login failed. Please check credentials.' });
        } finally {
          setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-sans">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        {/* Brand */}
        <div className="flex justify-center">
          <div className="w-9 h-9 rounded bg-zinc-900 flex items-center justify-center text-white font-mono text-sm font-semibold tracking-wider">
            SF
          </div>
        </div>
        <h2 className="mt-4 text-center text-xl font-semibold tracking-tight text-zinc-900">
          Sign in to StockFlow
        </h2>
        <p className="mt-1 text-center text-xs text-zinc-500">
          Inventory Management System
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-6 border border-zinc-200 rounded-lg shadow-sm sm:px-8 space-y-6">
          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            <Input
              label="Work email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@company.com"
              error={errors.email}
              required
            />

            <Input
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              error={errors.password}
              required
            />

            <div className="pt-2">
              <Button
                type="submit"
                variant="primary"
                className="w-full"
                loading={isLoading}
              >
                Sign In
              </Button>
            </div>
          </form>

          {/* Demo account note */}
          <div className="pt-4 border-t border-zinc-100 text-center">
            <p className="text-[11px] text-zinc-400">
              Demo account pre-filled for assessment review.
            </p>
          </div>

          <div className="text-center text-xs text-zinc-500">
            Don't have an organization account?{' '}
            <Link
              to="/signup"
              className="text-blue-600 hover:text-blue-700 font-medium"
            >
              Sign up
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
