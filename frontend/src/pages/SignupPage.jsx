import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';

export default function SignupPage() {
  const [formData, setFormData] = useState({
    name: 'Alex Chen',
    organization: 'Acme Logistics Inc.',
    email: 'alex@stockflow.dev',
    password: 'password123',
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  const { signup } = useAuth();
  const navigate = useNavigate();

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = 'Full name is required.';
    if (!formData.organization.trim()) newErrors.organization = 'Organization name is required.';
    if (!formData.email.trim()) {
      newErrors.email = 'Email address is required.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address.';
    }
    if (!formData.password) {
      newErrors.password = 'Password is required.';
    } else if (formData.password.length < 8) {
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
          await signup(formData);
          navigate('/dashboard');
        } catch (err) {
          setErrors({ form: err.message || 'Registration failed.' });
        } finally {
          setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-sans">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <div className="w-9 h-9 rounded bg-zinc-900 flex items-center justify-center text-white font-mono text-sm font-semibold tracking-wider">
            SF
          </div>
        </div>
        <h2 className="mt-4 text-center text-xl font-semibold tracking-tight text-zinc-900">
          Create an organization account
        </h2>
        <p className="mt-1 text-center text-xs text-zinc-500">
          Get started with StockFlow inventory operations
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-6 border border-zinc-200 rounded-lg shadow-sm sm:px-8 space-y-6">
          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            <Input
              label="Full name"
              value={formData.name}
              onChange={(e) => handleChange('name', e.target.value)}
              placeholder="e.g. Alex Chen"
              error={errors.name}
              required
            />

            <Input
              label="Organization name"
              value={formData.organization}
              onChange={(e) => handleChange('organization', e.target.value)}
              placeholder="e.g. Acme Logistics Ltd."
              error={errors.organization}
              required
            />

            <Input
              label="Work email"
              type="email"
              value={formData.email}
              onChange={(e) => handleChange('email', e.target.value)}
              placeholder="name@company.com"
              error={errors.email}
              required
            />

            <Input
              label="Password"
              type="password"
              value={formData.password}
              onChange={(e) => handleChange('password', e.target.value)}
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
                Create Account
              </Button>
            </div>
          </form>

          <div className="text-center text-xs text-zinc-500">
            Already have an account?{' '}
            <Link
              to="/login"
              className="text-blue-600 hover:text-blue-700 font-medium"
            >
              Sign in
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
