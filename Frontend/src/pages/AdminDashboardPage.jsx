import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { userAPI } from '../api';
import apiClient from '../api/apiClient';
import { Card, CardBody, CardHeader } from '../components/Card';
import { Button } from '../components/Button';
import { Alert } from '../components/Alert';
import { Trash2, Check, X, Edit2 } from 'lucide-react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

// Role mapping helper
const ROLE_MAP = {
  1: 'admin',
  3: 'user',
};

const getRoleName = (roleId) => ROLE_MAP[roleId] || 'user';

export const AdminDashboardPage = () => {
  const { t } = useTranslation();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState(null);
  const [editingUser, setEditingUser] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [stats, setStats] = useState([]);

  useEffect(() => {
    fetchData();
    fetchStats();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const uRes = await userAPI.getUser();
      const allUsers = uRes.data?.data || uRes.data || [];
      setUsers(allUsers);
    } catch (err) {
      console.error('Admin fetch error', err);
      setMessage({ type: 'error', text: 'Failed to load data' });
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const res = await apiClient.get('/orders/stats');
      setStats(res.data.data || []);
    } catch (err) {
      console.error('Stats error', err);
    }
  };

  const startEditUser = (u) => {
    setEditingUser(u.u_id);
    setEditForm({
      username: u.username,
      email: u.email,
      display_name: u.display_name,
    });
  };

  const saveUserEdit = async (userId) => {
    try {
      await userAPI.updateProfile(userId, editForm);
      setUsers((prev) =>
        prev.map((u) =>
          u.u_id === userId ? { ...u, ...editForm } : u
        )
      );
      setMessage({ type: 'success', text: t('admin.userUpdated') });
      setEditingUser(null);
    } catch (err) {
      console.error('Update failed', err);
      setMessage({ type: 'error', text: t('admin.failedUpdate') });
    }
  };

  const deleteUser = async (userId) => {
    if (!window.confirm(t('admin.confirmDelete'))) return;
    try {
      await apiClient.delete(`/users/${userId}`);
      setUsers((prev) => prev.filter((u) => u.u_id !== userId));
      setMessage({ type: 'success', text: t('admin.userDeleted') });
    } catch (err) {
      console.error('Delete failed', err);
      setMessage({ type: 'error', text: t('admin.failedDelete') });
    }
  };

  // removed teacher/question actions

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
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">{t('admin.title')}</h1>
              <p className="text-gray-600 dark:text-gray-400">{t('admin.subtitle')}</p>
            </div>
            <div>
              <a href="/admin/products" className="inline-block px-4 py-2 bg-emerald-600 text-white rounded">จัดการสินค้า</a>
            </div>
          </div>
        </div>

        {message && (
          <Alert
            type={message.type}
            message={message.text}
            onClose={() => setMessage(null)}
            className="mb-6"
          />
        )}

        <Card>
          <CardHeader>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">{t('admin.allUsers')}</h2>
          </CardHeader>
          <CardBody>
            <div className="space-y-4">
              {users.length === 0 ? (
                <p className="text-center text-gray-500 dark:text-gray-400 py-8">{t('admin.noUsers')}</p>
              ) : (
                users.map((u) => (
                  <div
                    key={u.u_id}
                    className="flex items-start justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700"
                  >
                    {editingUser === u.u_id ? (
                      <div className="flex-1 space-y-3">
                        <input
                          type="text"
                          placeholder={t('profile.username')}
                          value={editForm.username}
                          onChange={(e) =>
                            setEditForm({ ...editForm, username: e.target.value })
                          }
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                        />
                        <input
                          type="email"
                          placeholder={t('profile.email')}
                          value={editForm.email}
                          onChange={(e) =>
                            setEditForm({ ...editForm, email: e.target.value })
                          }
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                        />
                        <input
                          type="text"
                          placeholder={t('profile.displayName')}
                          value={editForm.display_name}
                          onChange={(e) =>
                            setEditForm({ ...editForm, display_name: e.target.value })
                          }
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                        />
                        <div className="flex gap-2">
                          <Button
                            variant="success"
                            size="sm"
                            onClick={() => saveUserEdit(u.u_id)}
                          >
                            {t('admin.save')}
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setEditingUser(null)}
                          >
                            {t('admin.cancel')}
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="font-semibold text-gray-900 dark:text-white">
                              {u.username || u.display_name}
                            </h3>
                            <span
                              className={`px-2 py-1 rounded-full text-xs font-medium ${
                                getRoleName(u.role_id) === 'admin'
                                  ? 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300'
                                  : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                              }`}
                            >
                              {getRoleName(u.role_id)}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {u.email}
                          </p>
                        </div>
                        <div className="flex gap-2 flex-shrink-0">
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => startEditUser(u)}
                            className="flex items-center gap-1"
                          >
                            <Edit2 size={16} /> {t('admin.edit')}
                          </Button>
                          <Button
                            variant="danger"
                            size="sm"
                            onClick={() => deleteUser(u.u_id)}
                            className="flex items-center gap-1"
                          >
                            <Trash2 size={16} /> {t('admin.delete')}
                          </Button>
                        </div>
                      </>
                    )}
                  </div>
                ))
              )}
            </div>
          </CardBody>
        </Card>
        <div className="mt-8">
          <Card>
            <CardHeader>
              <h2 className="text-xl font-bold">ยอดขายย้อนหลัง</h2>
            </CardHeader>
            <CardBody>
              {stats.length === 0 ? (
                <p className="text-sm text-gray-500">ไม่มีข้อมูล</p>
              ) : (
                <Line
                  data={{
                    labels: stats.map(s => s.day).reverse(),
                    datasets: [
                      {
                        label: 'ยอดขาย (฿)',
                        data: stats.map(s => Number(s.total_sales)).reverse(),
                        borderColor: '#059669',
                        backgroundColor: 'rgba(5,150,105,0.2)',
                      },
                    ],
                  }}
                  options={{ responsive: true, plugins: { legend: { display: false } } }}
                />
              )}
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  );
};
