import apiClient from './apiClient';

// ==================== AUTH ====================
// ฟังก์ชันเกี่ยวกับการลงทะเบียน/เข้าสู่ระบบ
export const authAPI = {
  // สมัครสมาชิกใหม่ (ส่ง username, email, password, role, avatar)
  register: (data) => {
    const formData = new FormData();
    formData.append('data', JSON.stringify({
      display_name: data.username,
      username: data.username,
      email: data.email,
      password: data.password,
      role: data.role || 'user', // ส่งบทบาท: 'user' หรือ 'teacher'
    }));
    if (data.avatar) {
      formData.append('file', data.avatar);
    }
    return apiClient.post('/auth/register', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
  // เข้าสู่ระบบ (ส่ง username/email + password)
  login: (data) => apiClient.post('/auth/login', {
    username: data.email || data.username,
    email: data.email,
    password: data.password,
  }),
};

// ==================== PRODUCTS / ORDERS ====================
export const productsAPI = {
  list: (params) => apiClient.get('/products', { params }),
  get: (id) => apiClient.get(`/products/${id}`),
  create: (data) => apiClient.post('/products', data),
  update: (id, data) => apiClient.put(`/products/${id}`, data),
  remove: (id) => apiClient.delete(`/products/${id}`),
};

export const ordersAPI = {
  create: (data) => apiClient.post('/orders/create', data),
  list: () => apiClient.get('/orders'),
  get: (id) => apiClient.get(`/orders/${id}`),
  getMyDownloads: () => apiClient.get('/orders/my-downloads'),
  pay: (id) => apiClient.post(`/orders/${id}/pay`),
  overview: () => apiClient.get('/orders/overview'),
};

// ==================== USERS ====================
// ฟังก์ชันจัดการข้อมูลผู้ใช้
export const userAPI = {
  // ดึงโปรไฟล์ผู้ใช้เฉพาะ ID
  getProfile: (userId) => apiClient.get(`/users/${userId}`),
  // ดึงข้อมูลผู้ใช้ทั้งหมด (Admin)
  getUser: () => apiClient.get('/users'),
  // เปลี่ยนรหัสผ่าน
  updatePassword: (data) => apiClient.put('/users/changepassword', data),
  // อัปเดตโปรไฟล์ผู้ใช้ (ชื่อ, รูปภาพ, etc)
  updateProfile: (userId, data) => {
    // If sending a file, use FormData
    if (data instanceof FormData) {
      return apiClient.put(`/users/${userId}`, data, { headers: { 'Content-Type': 'multipart/form-data' } });
    }
    // If data contains 'avatar' File, build FormData for upload to separate endpoint
    if (data?.avatar instanceof File) {
      const form = new FormData();
      form.append('file', data.avatar);
      // upload avatar via dedicated endpoint
      return apiClient.put(`/users/${userId}/avatar`, form, { headers: { 'Content-Type': 'multipart/form-data' } });
    }
    return apiClient.put(`/users/${userId}`, data);
  },
  uploadAvatar: (userId, file) => {
    const form = new FormData();
    form.append('file', file);
    return apiClient.put(`/users/${userId}/avatar`, form, { headers: { 'Content-Type': 'multipart/form-data' } });
  },
};