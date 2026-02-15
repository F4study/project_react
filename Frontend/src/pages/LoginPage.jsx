import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Mail, Lock } from 'lucide-react';
import { Button } from '../components/Button';
import { Input } from '../components/Form';
import { Alert } from '../components/Alert';
import { useAuthStore } from '../store';
import { authAPI } from '../api';
import { Logo } from '../components/Logo';

export const LoginPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { setUser, setIsLoading, isLoading, error, setError } = useAuthStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [formErrors, setFormErrors] = useState({});

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormErrors({});
    setError(null);

    if (!email || !password) {
      setFormErrors({
        email: !email ? t('validation.required') : '',
        password: !password ? t('validation.required') : '',
      });
      return;
    }

    try {
      setIsLoading(true);
      const response = await authAPI.login({ email, password });
      
      if (response.data.status && response.data.token) {
        const token = response.data.token;
        
        // Use user data from response if available, otherwise decode token
        let userData;
        if (response.data.user) {
          userData = response.data.user;
        } else {
          // Decode JWT to get user info (simple base64 decode for payload)
          const parts = token.split('.');
          if (parts.length === 3) {
            const payload = JSON.parse(atob(parts[1]));
            userData = {
              id: payload.id,
              username: payload.username,
              email: payload.email,
              role: payload.role_name,
              is_approved: payload.is_approved,
            };
          }
        }
        
        localStorage.setItem('authToken', token);
        localStorage.setItem('user', JSON.stringify(userData));
        setUser(userData);
        navigate('/dashboard');
      } else {
        setError(response.data.message || t('errors.loginFailed'));
      }
    } catch (err) {
      console.error('Login error:', err);
      setError(err.response?.data?.message || t('errors.loginFailed'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8">
          <div className="text-center mb-8">
            <Logo size={80} className="mx-auto mb-4" />
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">E-BOOK STORE</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">{t('login.subtitle')}</p>
          </div>

          {error && (
            <Alert type="error" message={error} onClose={() => setError(null)} className="mb-6" />
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              icon={Mail}
              label={t('login.email')}
              type="email"
              placeholder={t('login.emailPlaceholder')}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              error={formErrors.email}
            />

            <Input
              icon={Lock}
              label={t('login.password')}
              type="password"
              placeholder={t('login.passwordPlaceholder')}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              error={formErrors.password}
            />

            <Button
              type="submit"
              variant="primary"
              size="lg"
              isLoading={isLoading}
              className="w-full"
            >
              {t('auth.login')}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-600 dark:text-gray-400">
              {t('login.noAccount')}{' '}
              <a
                href="/register"
                  className="text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 font-semibold"
              >
                {t('auth.register')}
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
