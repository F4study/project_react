import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '../store';
import { userAPI } from '../api';
import { Card, CardBody, CardHeader } from '../components/Card';
import { Button } from '../components/Button';
import { Input } from '../components/Form';
import { Alert } from '../components/Alert';

export const EditProfilePage = () => {
  const { t } = useTranslation();
  const { user, setUser } = useAuthStore();
  const [formData, setFormData] = useState({
    username: user?.username || '',
    email: user?.email || '',
    display_name: user?.display_name || '',
  });
  const [isSaving, setIsSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const handleSave = async () => {
    setErrorMessage('');
    setSuccessMessage('');
    try {
      setIsSaving(true);
      const resp = await userAPI.updateProfile(user.id, formData);
      const updated = resp.data?.data || resp.data;
      if (updated) {
        setUser(updated);
        localStorage.setItem('user', JSON.stringify(updated));
        setSuccessMessage(t('profile.updateSuccess'));
      }
    } catch (err) {
      console.error('Update profile error', err);
      setErrorMessage(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setIsSaving(false);
      setTimeout(() => setSuccessMessage(''), 3000);
    }
  };

  if (!user) return <div className="min-h-screen flex items-center justify-center">{t('auth.notLoggedIn')}</div>;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card>
          <CardHeader>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">{t('profile.edit')}</h2>
          </CardHeader>
          <CardBody className="space-y-4">
            {successMessage && <Alert type="success" message={successMessage} onClose={() => setSuccessMessage('')} />}
            {errorMessage && <Alert type="error" message={errorMessage} onClose={() => setErrorMessage('')} />}

            <Input label={t('profile.username')} value={formData.username} onChange={(e) => setFormData(prev => ({...prev, username: e.target.value}))} />
            <Input label={t('profile.email')} type="email" value={formData.email} onChange={(e) => setFormData(prev => ({...prev, email: e.target.value}))} />
            <Input label={t('profile.displayName')} value={formData.display_name} onChange={(e) => setFormData(prev => ({...prev, display_name: e.target.value}))} />

            <div className="flex gap-3">
              <Button variant="primary" onClick={handleSave} isLoading={isSaving}>{t('profile.save')}</Button>
              <Button variant="outline" onClick={() => window.history.back()}>{t('profile.cancel')}</Button>
            </div>
          </CardBody>
        </Card>
      </div>
    </div>
  );
};
