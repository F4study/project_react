import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { User, Lock } from 'lucide-react';
import { useAuthStore } from '../store';
import { Card, CardBody, CardHeader } from '../components/Card';
import { Button } from '../components/Button';
import { Alert } from '../components/Alert';
import { userAPI } from '../api';
import { Input } from '../components/Form';

export const ProfilePage = () => {
  const { t } = useTranslation();
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({ username: user?.username || '', email: user?.email || '', display_name: user?.display_name || '' });
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [passwordForm, setPasswordForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });

  useEffect(() => {
    setLoading(false);
  }, [user?.id]);

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600 dark:text-gray-400">{t('auth.notLoggedIn')}</p>
      </div>
    );
  }

  // simplified profile view
  const { setUser } = useAuthStore();

  useEffect(() => {
    // keep local form in sync if user changes
    setFormData({ username: user?.username || '', email: user?.email || '', display_name: user?.display_name || '' });
  }, [user?.id]);

  const handleFileChange = (e) => {
    const f = e.target.files?.[0];
    if (f) {
      setAvatarFile(f);
      const url = URL.createObjectURL(f);
      setAvatarPreview(url);
    }
  };

  const handleSaveProfile = async () => {
    setErrorMessage('');
    setSuccessMessage('');
    try {
      setIsSaving(true);
      // If avatar selected, upload first
      if (avatarFile) {
        await userAPI.uploadAvatar(user.id, avatarFile);
      }
      const resp = await userAPI.updateProfile(user.id, { username: formData.username, email: formData.email, display_name: formData.display_name });
      const updated = resp.data?.data || resp.data;
      if (updated) {
        setUser(updated);
        localStorage.setItem('user', JSON.stringify(updated));
      }
      setSuccessMessage(t('profile.updateSuccess'));
      setIsEditing(false);
      setAvatarFile(null);
      setAvatarPreview(null);
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      console.error('Failed to save profile', err);
      setErrorMessage(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setIsSaving(false);
    }
  };

  const handleChangePassword = async () => {
    setErrorMessage('');
    setSuccessMessage('');

    if (!passwordForm.currentPassword || !passwordForm.newPassword || !passwordForm.confirmPassword) {
      setErrorMessage('All fields are required');
      return;
    }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setErrorMessage(t('validation.passwordMismatch'));
      return;
    }
    if (passwordForm.newPassword.length < 6) {
      setErrorMessage('Password must be at least 6 characters');
      return;
    }

    try {
      setIsSaving(true);
      await userAPI.updatePassword({ current_password: passwordForm.currentPassword, new_password: passwordForm.newPassword });
      setSuccessMessage(t('profile.passwordChanged'));
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setShowPasswordForm(false);
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      console.error('Failed to change password', err);
      setErrorMessage(err.response?.data?.message || t('profile.passwordUpdateFailed'));
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="animate-spin text-4xl mb-4">⚙️</div>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-6 mb-6">
            {user.avatar_url ? (
              <img
                src={`http://localhost:7000/uploads/${user.avatar_url}`}
                alt={user.username}
                className="w-24 h-24 rounded-full object-cover border-4 border-cyan-600 shadow-lg"
                onError={(e) => { e.target.style.display = 'none'; }}
              />
            ) : (
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white text-4xl font-bold">
                {user.username?.charAt(0).toUpperCase()}
              </div>
            )}
            <div>
              <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
                {user.display_name || user.username}
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-400">{user.email}</p>
            </div>
          </div>

          {successMessage && (
            <Alert type="success" message={successMessage} onClose={() => setSuccessMessage('')} className="mb-4" />
          )}
          {errorMessage && (
            <Alert type="error" message={errorMessage} onClose={() => setErrorMessage('')} className="mb-4" />
          )}
        </div>

        {/* Basic Info */}

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                      <div className="flex justify-between items-center">
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white">{t('profile.personalInfo')}</h2>
                        <div className="flex gap-2">
                          <Button variant={isEditing ? 'danger' : 'secondary'} size="sm" onClick={() => setIsEditing(!isEditing)}>{isEditing ? t('profile.cancel') : t('profile.edit')}</Button>
                          <Button variant="outline" size="sm" onClick={() => setShowPasswordForm(!showPasswordForm)}>{t('profile.changePassword')}</Button>
                        </div>
                      </div>
              </CardHeader>
              <CardBody className="space-y-4">
                {isEditing ? (
                  <>
                    <Input label={t('profile.username')} value={formData.username} onChange={(e) => setFormData(prev => ({...prev, username: e.target.value}))} />
                    <Input label={t('profile.email')} type="email" value={formData.email} onChange={(e) => setFormData(prev => ({...prev, email: e.target.value}))} />
                    <Input label={t('profile.displayName')} value={formData.display_name} onChange={(e) => setFormData(prev => ({...prev, display_name: e.target.value}))} />
                    <div>
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-300 block mb-2">{t('register.avatar')} (Optional)</label>
                      <input type="file" accept="image/*" onChange={handleFileChange} />
                      {avatarPreview && <img src={avatarPreview} alt="preview" className="w-24 h-24 mt-2 rounded" />}
                    </div>
                    <div className="flex gap-3 mt-4">
                      <Button variant="primary" onClick={handleSaveProfile} isLoading={isSaving}>{t('profile.save')}</Button>
                      <Button variant="outline" onClick={() => { setIsEditing(false); setFormData({ username: user.username, email: user.email, display_name: user.display_name }); setAvatarFile(null); setAvatarPreview(null); }}>{t('profile.cancel')}</Button>
                    </div>
                  </>
                ) : (
                  <>
                    <div>
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-300 block mb-2">{t('profile.username')}</label>
                      <p className="text-gray-900 dark:text-white font-medium">{user.username}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-300 block mb-2">{t('profile.email')}</label>
                      <p className="text-gray-900 dark:text-white font-medium">{user.email}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-300 block mb-2">{t('profile.displayName')}</label>
                      <p className="text-gray-900 dark:text-white font-medium">{user.display_name || '-'}</p>
                    </div>
                  </>
                )}
                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300 block mb-2">{t('profile.joinedDate')}</label>
                  <p className="text-gray-900 dark:text-white font-medium">{(() => { const raw = user.createdAt || user.created_at || user.created; try { return raw ? new Date(raw).toLocaleDateString() : '-'; } catch (e) { return '-'; } })()}</p>
                </div>
              </CardBody>
            </Card>
          </div>

          {/* Security Card */}
          <div>
            <Card>
              <CardHeader>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">🔒 {t('profile.changePassword')}</h2>
              </CardHeader>
              <CardBody>
                {showPasswordForm ? (
                  <div className="space-y-3">
                    {errorMessage && <Alert type="error" message={errorMessage} onClose={() => setErrorMessage('')} />}
                    {successMessage && <Alert type="success" message={successMessage} onClose={() => setSuccessMessage('')} />}
                    <div>
                      <label className="text-sm text-gray-700 dark:text-gray-300 block mb-1">{t('profile.currentPassword')}</label>
                      <input type="password" value={passwordForm.currentPassword} onChange={(e) => setPasswordForm(prev => ({...prev, currentPassword: e.target.value}))} className="w-full px-3 py-2 border rounded" />
                    </div>
                    <div>
                      <label className="text-sm text-gray-700 dark:text-gray-300 block mb-1">{t('profile.newPassword')}</label>
                      <input type="password" value={passwordForm.newPassword} onChange={(e) => setPasswordForm(prev => ({...prev, newPassword: e.target.value}))} className="w-full px-3 py-2 border rounded" />
                    </div>
                    <div>
                      <label className="text-sm text-gray-700 dark:text-gray-300 block mb-1">{t('profile.confirmPassword')}</label>
                      <input type="password" value={passwordForm.confirmPassword} onChange={(e) => setPasswordForm(prev => ({...prev, confirmPassword: e.target.value}))} className="w-full px-3 py-2 border rounded" />
                    </div>
                    <div className="flex gap-3">
                      <Button variant="primary" onClick={handleChangePassword} isLoading={isSaving}>{t('profile.updatePassword')}</Button>
                      <Button variant="outline" onClick={() => { setShowPasswordForm(false); setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' }); setErrorMessage(''); }}>{t('profile.cancel')}</Button>
                    </div>
                  </div>
                ) : (
                  <div>
                    <p className="text-gray-600 dark:text-gray-400">{t('profile.changePassword')}</p>
                    <div className="mt-4">
                      <Button variant="secondary" className="w-full" onClick={() => setShowPasswordForm(true)}><Lock size={16} /> {t('profile.changePassword')}</Button>
                    </div>
                  </div>
                )}
              </CardBody>
            </Card>
          </div>
        </div>

        {/* no extra widgets */}
      </div>
    </div>
  );
};
