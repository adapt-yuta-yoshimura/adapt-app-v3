import axios from 'axios';

export const adminApiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL ?? 'http://app.localhost.adapt:4000',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

/** リクエストインターセプター: JWTトークンを付与 */
adminApiClient.interceptors.request.use(
  (config) => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('admin_access_token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error),
);

/** レスポンスインターセプター: 401時にリフレッシュトークンで再試行 */
adminApiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      typeof window !== 'undefined'
    ) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('admin_refresh_token');
        if (!refreshToken) {
          throw new Error('No refresh token');
        }

        const { data } = await axios.post<{ accessToken: string }>(
          `${process.env.NEXT_PUBLIC_API_URL ?? 'http://app.localhost.adapt:4000'}/api/v1/auth/refresh`,
          { refreshToken },
        );

        localStorage.setItem('admin_access_token', data.accessToken);
        originalRequest.headers.Authorization = `Bearer ${data.accessToken}`;
        return adminApiClient(originalRequest);
      } catch {
        localStorage.removeItem('admin_access_token');
        localStorage.removeItem('admin_refresh_token');
        window.location.href = '/login';
        return Promise.reject(error);
      }
    }

    return Promise.reject(error);
  },
);
