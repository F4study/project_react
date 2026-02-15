import React, { useState } from 'react';
import { useCartStore } from '../store';
import apiClient from '../api/apiClient';
import { Button } from '../components/Button';

export const CheckoutPage = () => {
  const items = useCartStore(s=>s.items);
  const clear = useCartStore(s=>s.clear);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [result, setResult] = useState(null);

  const handleCheckout = async () => {
    const payload = { customer_name: name, customer_email: email, items };
    const res = await apiClient.post('/orders/create', payload);
    if (res.data?.status) {
      const orderId = res.data.orderId;
      // Immediately perform mock payment to get download tokens
      const payRes = await apiClient.post(`/orders/${orderId}/pay`);
      if (payRes.data?.status) {
        setResult({ orderId, downloadTokens: payRes.data.downloadTokens });
        clear();
      } else {
        setResult({ orderId, downloadTokens: [] });
      }
    }
  };

  if (result) {
    return (
      <div className="min-h-screen p-8 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-2xl mx-auto bg-white dark:bg-gray-800 p-6 rounded">
          <h2 className="text-xl font-bold">Order created</h2>
          <p>Order ID: {result.orderId}</p>
          <div className="mt-4">
            <h3 className="font-semibold">Download Links (temporary)</h3>
            <ul className="list-disc ml-6 mt-2">
              {result.downloadTokens?.map(dt => (
                <li key={dt.token}><a className="text-emerald-600" href={`/api/download/${dt.token}`}>Download product {dt.product_id}</a> (expires: {new Date(dt.expires_at).toLocaleString()})</li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-8 bg-gray-50 dark:bg-gray-900">
      <div className="max-w-2xl mx-auto bg-white dark:bg-gray-800 p-6 rounded">
        <h2 className="text-xl font-bold mb-4">Checkout</h2>
        <div className="space-y-3">
          <input className="w-full px-3 py-2 border rounded" placeholder="Name" value={name} onChange={e=>setName(e.target.value)} />
          <input className="w-full px-3 py-2 border rounded" placeholder="Email" value={email} onChange={e=>setEmail(e.target.value)} />
          <div className="text-right font-bold">Total: ฿{items.reduce((s,i)=>s+(i.price*i.qty),0).toFixed(2)}</div>
          <div className="text-right">
            <Button onClick={handleCheckout}>Place order (Mock payment)</Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;
