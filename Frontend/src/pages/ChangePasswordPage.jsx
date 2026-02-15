import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '../store';
import { userAPI } from '../api';
import { Card, CardBody, CardHeader } from '../components/Card';
import { Button } from '../components/Button';
import { Alert } from '../components/Alert';

export const ChangePasswordPage = () => {
  const { t } = useTranslation();
  const { user } = useAuthStore();
  const [form, setForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [isSaving, setIsSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async () => {
    setErrorMessage('');
    setSuccessMessage('');
    if (!form.currentPassword || !form.newPassword || !form.confirmPassword) {
      setErrorMessage(t('validation.required'));
      return;
    }
    if (form.newPassword !== form.confirmPassword) {
      setErrorMessage(t('validation.passwordMismatch'));
      return;
    }
    if (form.newPassword.length < 6) {
      setErrorMessage('Password must be at least 6 characters');
      return;
    }

    try {
      setIsSaving(true);
      await userAPI.updatePassword({ current_password: form.currentPassword, new_password: form.newPassword });
      setSuccessMessage(t('profile.passwordChanged'));
      setForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      console.error('Change password error', err);
      setErrorMessage(err.response?.data?.message || t('profile.passwordUpdateFailed'));
    } finally {
      setIsSaving(false);
    }
  };

  if (!user) return <div className="min-h-screen flex items-center justify-center">{t('auth.notLoggedIn')}</div>;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-md mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card>
          <CardHeader>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">{t('profile.changePassword')}</h2>
          </CardHeader>
          <CardBody className="space-y-4">
            {successMessage && <Alert type="success" message={successMessage} onClose={() => setSuccessMessage('')} />}
            {errorMessage && <Alert type="error" message={errorMessage} onClose={() => setErrorMessage('')} />}

            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300 block mb-2">{t('profile.currentPassword')}</label>
              <input type="password" value={form.currentPassword} onChange={(e) => setForm(prev => ({...prev, currentPassword: e.target.value}))} className="w-full px-3 py-2 border rounded" />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300 block mb-2">{t('profile.newPassword')}</label>
              <input type="password" value={form.newPassword} onChange={(e) => setForm(prev => ({...prev, newPassword: e.target.value}))} className="w-full px-3 py-2 border rounded" />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300 block mb-2">{t('profile.confirmPassword')}</label>
              <input type="password" value={form.confirmPassword} onChange={(e) => setForm(prev => ({...prev, confirmPassword: e.target.value}))} className="w-full px-3 py-2 border rounded" />
            </div>

            <div className="flex gap-3">
              <Button variant="primary" onClick={handleSubmit} isLoading={isSaving}>{t('profile.updatePassword')}</Button>
              <Button variant="outline" onClick={() => window.history.back()}>{t('profile.cancel')}</Button>
            </div>
          </CardBody>
        </Card>
      </div>
    </div>
  );
};
