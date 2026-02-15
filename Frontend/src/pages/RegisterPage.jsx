import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { User, Mail, Lock } from 'lucide-react';
import { Button } from '../components/Button';
import { Input } from '../components/Form';
import { Alert } from '../components/Alert';
import { authAPI } from '../api';
import { Logo } from '../components/Logo';

export const RegisterPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    avatar: null,
    role: 'user',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [formErrors, setFormErrors] = useState({});

  const validateForm = () => {
    const errors = {};

    if (!formData.username) errors.username = t('validation.required');
    if (!formData.email) errors.email = t('validation.required');
    if (!formData.password) errors.password = t('validation.required');
    if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = t('validation.passwordMismatch');
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!validateForm()) return;

    try {
      setIsLoading(true);
      const response = await authAPI.register({
        username: formData.username,
        email: formData.email,
        password: formData.password,
        avatar: formData.avatar,
        role: formData.role, // 'user' or 'teacher'
      });

      if (response.data.status) {
        // Show success and redirect to login
        navigate('/login');
      } else {
        setError(response.data.message || t('errors.registrationFailed'));
      }
    } catch (err) {
      console.error('Registration error:', err);
      setError(err.response?.data?.message || t('errors.registrationFailed'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData((prev) => ({ ...prev, avatar: file }));
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8">
          <div className="text-center mb-8">
            <Logo size={80} className="mx-auto mb-4" />
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{t('auth.register')}</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">{t('register.subtitle')}</p>
          </div>

          {error && (
            <Alert type="error" message={error} onClose={() => setError('')} className="mb-6" />
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              icon={User}
              label={t('register.username')}
              name="username"
              placeholder={t('register.usernamePlaceholder')}
              value={formData.username}
              onChange={handleChange}
              error={formErrors.username}
            />

            <Input
              icon={Mail}
              label={t('register.email')}
              name="email"
              type="email"
              placeholder={t('register.emailPlaceholder')}
              value={formData.email}
              onChange={handleChange}
              error={formErrors.email}
            />

            <Input
              icon={Lock}
              label={t('register.password')}
              name="password"
              type="password"
              placeholder={t('register.passwordPlaceholder')}
              value={formData.password}
              onChange={handleChange}
              error={formErrors.password}
            />

            <Input
              icon={Lock}
              label={t('register.confirmPassword')}
              name="confirmPassword"
              type="password"
              placeholder={t('register.confirmPasswordPlaceholder')}
              value={formData.confirmPassword}
              onChange={handleChange}
              error={formErrors.confirmPassword}
            />

            {/* Role fixed to user for e-book store */}

            <div className="w-full">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t('register.avatar')} (Optional)
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm"
              />
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              isLoading={isLoading}
              className="w-full"
            >
              {t('auth.register')}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-600 dark:text-gray-400">
              {t('register.hasAccount')}{' '}
              <a
                href="/login"
                className="text-cyan-600 dark:text-cyan-400 hover:text-cyan-700 dark:hover:text-cyan-300 font-semibold"
              >
                {t('auth.login')}
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
