import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('refresh_token');
        if (refreshToken) {
          const response = await axios.post(`${API_BASE_URL}/auth/token/refresh/`, {
            refresh: refreshToken,
          });

          const { access } = response.data;
          localStorage.setItem('access_token', access);
          
          originalRequest.headers.Authorization = `Bearer ${access}`;
          return api(originalRequest);
        }
      } catch (refreshError) {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        window.location.href = '/login';
      }
    }

    return Promise.reject(error);
  }
);

export const authAPI = {
  login: (email: string, password: string) =>
    api.post('/accounts/login/', { email, password }),
  
  register: (userData: any) =>
    api.post('/accounts/register/', userData),
  
  logout: () =>
    api.post('/accounts/logout/', { refresh: localStorage.getItem('refresh_token') }),
  
  getProfile: () =>
    api.get('/accounts/profile/'),
  
  updateProfile: (data: any) =>
    api.patch('/accounts/profile/update/', data),
  
  changePassword: (data: any) =>
    api.post('/accounts/password/change/', data),
  
  uploadProfileImage: (file: File) => {
    const formData = new FormData();
    formData.append('profile_picture', file);
    return api.post('/accounts/profile/image/upload/', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },
  
  deleteProfileImage: () =>
    api.delete('/accounts/profile/image/delete/'),
};

export const propertiesAPI = {
  getProperties: (params?: any) =>
    api.get('/properties/', { params }),
  
  searchProperties: (params?: any) =>
    api.get('/properties/search/', { params }),
  
  getProperty: (id: number) =>
    api.get(`/properties/${id}/`),
  
  createProperty: (data: any) =>
    api.post('/properties/create/', data),
  
  updateProperty: (id: number, data: any) =>
    api.patch(`/properties/${id}/update/`, data),
  
  deleteProperty: (id: number) =>
    api.delete(`/properties/${id}/delete/`),
  
  getUserProperties: () =>
    api.get('/properties/my-properties/'),
  
  getPropertyStats: () =>
    api.get('/properties/stats/'),
  
  getPropertyImages: (propertyId: number) =>
    api.get(`/properties/${propertyId}/images/`),
  
  uploadPropertyImage: (propertyId: number, file: File, caption?: string, isPrimary?: boolean) => {
    const formData = new FormData();
    formData.append('image', file);
    if (caption) formData.append('caption', caption);
    if (isPrimary) formData.append('is_primary', 'true');
    return api.post(`/properties/${propertyId}/images/upload/`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },
  
  deletePropertyImage: (propertyId: number, imageId: number) =>
    api.delete(`/properties/${propertyId}/images/${imageId}/delete/`),
  
  setPrimaryImage: (propertyId: number, imageId: number) =>
    api.post(`/properties/${propertyId}/images/${imageId}/set-primary/`),
};

export const applicationsAPI = {
  getApplications: () =>
    api.get('/applications/'),
  
  getApplication: (id: number) =>
    api.get(`/applications/${id}/`),
  
  createApplication: (data: any) =>
    api.post('/applications/create/', data),
  
  updateApplication: (id: number, data: any) =>
    api.patch(`/applications/${id}/update/`, data),
  
  getApplicationMessages: (id: number) =>
    api.get(`/applications/${id}/messages/`),
  
  sendMessage: (id: number, message: string) =>
    api.post(`/applications/${id}/messages/`, { message }),
  
  getApplicationDocuments: (id: number) =>
    api.get(`/applications/${id}/documents/`),
  
  uploadDocument: (id: number, data: any) =>
    api.post(`/applications/${id}/documents/`, data),
  
  getApplicationStats: () =>
    api.get('/applications/stats/'),
};

export default api;
