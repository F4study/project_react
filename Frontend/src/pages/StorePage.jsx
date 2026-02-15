import React, { useEffect, useState } from 'react';
import apiClient from '../api/apiClient';
import { useCartStore, useAuthStore } from '../store';
import { Button } from '../components/Button';
import { ordersAPI } from '../api';
import { useNavigate } from 'react-router-dom';

export const StorePage = () => {
  const [products, setProducts] = useState([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState('');
  const addItem = useCartStore((s) => s.addItem);
  const items = useCartStore((s) => s.items);
  const removeItem = useCartStore((s) => s.removeItem);
  const clearCart = useCartStore((s) => s.clear);
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [showCart, setShowCart] = useState(false);

  const load = async () => {
    const res = await apiClient.get('/products', { params: { page, limit: 12, search } });
    setProducts(res.data.data || []);
    setTotal(res.data.meta?.total || 0);
  };

  useEffect(() => { load(); }, [page, search]);

  // simple image pool from server uploads to use as thumbnails when no image provided
  const imagePool = [
    '0865e89889d0fda206c847fb449ce7ae.png',
    '627c087512a217a6f22c4ac4f238be03.webp',
    '4ad2cdc0b49d989d7aecd82981b00183.webp',
    '0865e89889d0fda206c847fb449ce7ae.png',
  ];

  return (
    <div className="min-h-screen p-8 bg-gray-50 dark:bg-gray-900">
      <div className="max-w-6xl mx-auto">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-3xl font-bold">Store</h1>
          <div className="flex items-center gap-3">
            <input
              placeholder="Search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="px-3 py-2 border rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            />

            <div className="relative">
              <button onClick={() => setShowCart(!showCart)} className="px-3 py-2 bg-white dark:bg-gray-800 border rounded">
                🛒 Cart {items?.length ? `(${items.length})` : ''}
              </button>

              {showCart && (
                <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-800 rounded shadow-lg border border-gray-200 dark:border-gray-700 p-3 z-50">
                  {items.length === 0 ? (
                    <p className="text-sm text-gray-600">Your cart is empty.</p>
                  ) : (
                    <div className="space-y-2">
                      {items.map((it) => (
                        <div key={it.product_id} className="flex items-center justify-between">
                          <div>
                            <div className="font-medium">{it.name}</div>
                            <div className="text-sm text-gray-500">฿{it.price} x {it.qty}</div>
                          </div>
                          <div className="flex flex-col items-end gap-1">
                            <button className="text-sm text-red-500" onClick={() => removeItem(it.product_id)}>Remove</button>
                          </div>
                        </div>
                      ))}

                      <div className="pt-2 border-t border-gray-100 dark:border-gray-700">
                        <div className="flex justify-between font-semibold">
                          <div>Total</div>
                          <div>฿{items.reduce((s, i) => s + (i.price * i.qty), 0)}</div>
                        </div>
                        <div className="mt-3 flex gap-2">
                          <button onClick={() => { setShowCart(false); navigate('/cart'); }} className="flex-1 px-3 py-2 bg-gray-100 dark:bg-gray-700 rounded">View Cart</button>
                          <button onClick={async () => {
                            if (!user) return navigate('/login');
                            try {
                              const payload = {
                                customer_name: user.display_name || user.username,
                                customer_email: user.email,
                                items: items.map(i => ({ product_id: i.product_id, qty: i.qty, price: i.price })),
                              };
                              const createRes = await ordersAPI.create(payload);
                              if (createRes?.data?.status) {
                                const orderId = createRes.data.orderId;
                                const payRes = await ordersAPI.pay(orderId);
                                if (payRes?.data?.status) {
                                  clearCart();
                                  setShowCart(false);
                                  alert('Purchase successful! Your downloads are available in Dashboard.');
                                  navigate('/dashboard');
                                }
                              }
                            } catch (err) {
                              console.error('Checkout error', err);
                              alert('Checkout failed');
                            }
                          }} className="flex-1 px-3 py-2 bg-emerald-600 text-white rounded">Buy Now</button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((p, idx) => {
            const hasImage = p.image_url || false;
            const imgSrc = hasImage
              ? `http://localhost:7000/${p.image_url}`
              : `http://localhost:7000/uploads/${imagePool[idx % imagePool.length]}`;
            return (
              <div key={p.id} className="p-4 bg-white dark:bg-gray-800 rounded shadow">
                <div className="h-40 mb-3 rounded overflow-hidden bg-gray-100 flex items-center justify-center">
                  <img src={imgSrc} alt={p.name} className="object-cover w-full h-full" />
                </div>
                <h3 className="font-semibold mb-2">{p.name}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">{p.description}</p>
                <div className="flex items-center justify-between">
                  <div className="text-lg font-bold">฿{p.price}</div>
                  <Button size="sm" onClick={() => addItem(p)}>Add to cart</Button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default StorePage;
