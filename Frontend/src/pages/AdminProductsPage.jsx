import React, { useEffect, useState } from 'react';
import apiClient from '../api/apiClient';
import { Button } from '../components/Button';
import { Card, CardBody, CardHeader } from '../components/Card';

export const AdminProductsPage = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ name: '', description: '', price: '' });
  const [file, setFile] = useState(null);
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const res = await apiClient.get('/products?limit=100');
      setProducts(res.data.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        alert('กรุณาเข้าสู่ระบบด้วยบัญชีผู้ดูแลก่อนสร้างสินค้า');
        return window.location.href = '/login';
      }

      const fd = new FormData();
      fd.append('name', form.name || '');
      fd.append('description', form.description || '');
      fd.append('price', Number(form.price) || 0);
      if (file) fd.append('file', file);

      let res;
      if (editingId) {
        res = await apiClient.put(`/products/${editingId}`, fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      } else {
        res = await apiClient.post('/products', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      }

      if (res.data?.status) {
        setForm({ name: '', description: '', price: '' });
        setFile(null);
        setEditingId(null);
        fetchProducts();
        alert('สำเร็จ');
      } else {
        alert(res.data?.message || 'ไม่สามารถสร้าง/อัปเดตสินค้าได้');
      }
    } catch (err) {
      console.error('Create/Update product failed', err);
      alert(err.response?.data?.message || 'เกิดข้อผิดพลาดขณะสร้าง/อัปเดตสินค้า');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('ลบสินค้านี้หรือไม่?')) return;
    try {
      await apiClient.delete(`/products/${id}`);
      fetchProducts();
    } catch (err) {
      console.error('Delete failed', err);
      const msg = err.response?.data?.message || err.message || 'ลบไม่สำเร็จ';
      alert(`ลบไม่สำเร็จ: ${msg}`);
    }
  };

  const handleEdit = (p) => {
    setEditingId(p.id);
    setForm({ name: p.name || '', description: p.description || '', price: p.price || '' });
    setFile(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setForm({ name: '', description: '', price: '' });
    setFile(null);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-8">
      <div className="max-w-5xl mx-auto">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">จัดการสินค้า (E-books)</h1>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <h3 className="text-lg font-semibold">{editingId ? 'แก้ไขสินค้า' : 'สร้างสินค้าใหม่'}</h3>
          </CardHeader>
          <CardBody>
            <form onSubmit={handleCreate} className="space-y-3">
              <input value={form.name} onChange={(e)=>setForm({...form,name:e.target.value})} placeholder="ชื่อหนังสือ" className="w-full p-2 border rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-400" />
              <textarea value={form.description} onChange={(e)=>setForm({...form,description:e.target.value})} placeholder="คำอธิบาย" className="w-full p-2 border rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-400" />
              <input value={form.price} onChange={(e)=>setForm({...form,price:e.target.value})} placeholder="ราคา" type="number" className="w-full p-2 border rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-400" />
              <div className="flex items-center gap-3">
                <input type="file" accept=".pdf,.zip" onChange={(e)=>setFile(e.target.files[0])} />
                {editingId && <div className="text-sm text-gray-500">แก้ไขสินค้า #{editingId}</div>}
              </div>
              <div className="flex gap-2">
                <Button type="submit">{editingId ? 'อัปเดต' : 'สร้าง'}</Button>
                {editingId && <Button variant="secondary" onClick={handleCancelEdit}>ยกเลิก</Button>}
              </div>
            </form>
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold">รายการสินค้า</h3>
          </CardHeader>
          <CardBody>
            {loading ? <p>Loading...</p> : (
              <div className="space-y-3">
                {products.length === 0 && <p className="text-sm text-gray-500">ยังไม่มีสินค้า</p>}
                {products.map(p=> (
                  <div key={p.id} className="flex items-center justify-between p-3 bg-white dark:bg-gray-800 rounded border">
                    <div>
                      <h4 className="font-semibold">{p.name} <span className="text-sm text-gray-500">฿{p.price}</span></h4>
                      <p className="text-sm text-gray-600">{p.description}</p>
                      {p.file_path && (
                        <p className="text-sm mt-1">
                          <a href={`${(import.meta.env.VITE_API_URL || 'http://localhost:7000/api').replace(/\/api$/, '')}/download-file/${p.file_path}`} target="_blank" rel="noreferrer" className="text-emerald-600">ดูไฟล์/ดาวน์โหลด</a>
                        </p>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <Button onClick={()=>handleEdit(p)}>แก้ไข</Button>
                      <Button variant="danger" onClick={()=>handleDelete(p.id)}>ลบ</Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardBody>
        </Card>
      </div>
    </div>
  );
};

export default AdminProductsPage;
