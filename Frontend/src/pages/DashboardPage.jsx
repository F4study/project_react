import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '../store';
import { ordersAPI } from '../api';
import { Card, CardBody, CardHeader } from '../components/Card';
import { Button } from '../components/Button';
import { Link } from 'react-router-dom';

export const DashboardPage = () => {
  const { t } = useTranslation();
  const { user } = useAuthStore();
  const [isLoading, setIsLoading] = useState(true);
  const [overview, setOverview] = useState({ total_sales: 0, total_orders: 0, total_users: 0 });
  const [downloads, setDownloads] = useState([]);

  useEffect(() => {
    const load = async () => {
      try {
        const o = await ordersAPI.overview();
        if (o?.data?.status) setOverview(o.data.data || {});
      } catch (err) {
        console.error('overview error', err);
      }

      if (user?.id) {
        try {
          const resp = await ordersAPI.getMyDownloads();
          if (resp?.data?.status) {
            setDownloads(resp.data.data || resp.data || []);
          }
        } catch (err) {
          console.error('Failed to fetch downloads:', err);
        }
      }

      setIsLoading(false);
    };

    load();
  }, [user?.id]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin text-4xl">⚙️</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">{t('dashboard.welcome')}, {user?.username || 'Guest'}</h1>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="p-6 bg-white dark:bg-gray-800 rounded shadow">
            <h3 className="text-sm text-gray-500">Total Sales</h3>
            <p className="text-2xl font-bold">฿{Number(overview.total_sales || 0).toFixed(2)}</p>
          </div>
          <div className="p-6 bg-white dark:bg-gray-800 rounded shadow">
            <h3 className="text-sm text-gray-500">Total Orders</h3>
            <p className="text-2xl font-bold">{overview.total_orders || 0}</p>
          </div>
          <div className="p-6 bg-white dark:bg-gray-800 rounded shadow">
            <h3 className="text-sm text-gray-500">Total Users</h3>
            <p className="text-2xl font-bold">{overview.total_users || 0}</p>
          </div>
        </div>

        <div className="mt-6">
          <Card>
            <CardHeader>
              <h2 className="text-xl font-bold">{t('dashboard.myDownloads') || 'My Downloads'}</h2>
            </CardHeader>
            <CardBody>
              {downloads.length === 0 ? (
                <p className="text-gray-600 dark:text-gray-400">{t('dashboard.noDownloads') || 'You have no downloads yet.'}</p>
              ) : (
                <div className="space-y-3">
                  {downloads.map(d => (
                    <div key={d.token} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded">
                      <div>
                        <p className="font-semibold text-gray-900 dark:text-white">{d.product_name || d.file_path || 'E-Book'}</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{d.expires_at ? new Date(d.expires_at).toLocaleString() : ''}</p>
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <a href={`${(import.meta.env.VITE_API_URL || 'http://localhost:7000/api').replace(/\/api$/, '')}/download/${d.token}`} className="px-3 py-1 bg-emerald-600 text-white rounded hover:opacity-90" target="_blank" rel="noreferrer">{t('dashboard.download') || 'Download'}</a>
                          <a href={`${(import.meta.env.VITE_API_URL || 'http://localhost:7000/api').replace(/\/api$/, '')}/download/${d.token}`} className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white rounded hover:opacity-90" target="_blank" rel="noreferrer">{t('dashboard.read') || 'Read'}</a>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  );
};
