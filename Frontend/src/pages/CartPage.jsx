import React from 'react';
import { useCartStore } from '../store';
import { Button } from '../components/Button';
import { Link } from 'react-router-dom';

export const CartPage = () => {
  const items = useCartStore(s=>s.items);
  const removeItem = useCartStore(s=>s.removeItem);
  const total = items.reduce((s,i)=>s + (parseFloat(i.price||0) * (i.qty||1)),0);

  return (
    <div className="min-h-screen p-8 bg-gray-50 dark:bg-gray-900">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-4">Your Cart</h1>
        {items.length===0 ? (
          <p>Your cart is empty.</p>
        ) : (
          <div className="space-y-4">
            {items.map(it => (
              <div key={it.product_id} className="flex items-center justify-between p-4 bg-white dark:bg-gray-800 rounded">
                <div>
                  <div className="font-medium">{it.name}</div>
                  <div className="text-sm text-gray-500">Qty: {it.qty}</div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="font-bold">฿{(it.price*it.qty).toFixed(2)}</div>
                  <Button variant="danger" size="sm" onClick={()=>removeItem(it.product_id)}>Remove</Button>
                </div>
              </div>
            ))}
            <div className="text-right font-bold">Total: ฿{total.toFixed(2)}</div>
            <div className="text-right">
              <Link to="/checkout"><Button>Checkout</Button></Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default CartPage;
