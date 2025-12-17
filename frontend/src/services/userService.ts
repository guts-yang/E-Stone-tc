import axiosInstance from './axiosConfig';

interface LoginCredentials {
  username: string;
  password: string;
}

interface RegisterData {
  username: string;
  email: string;
  password: string;
  name: string;
  phone?: string;
  address?: string;
}

interface AuthResponse {
  token: string;
  user: {
    id: number;
    username: string;
    email: string;
    role: string;
    status: string;
  };
  message: string;
}

interface UserResponse {
  user: {
    id: number;
    username: string;
    email: string;
    role: string;
    status: string;
    profile?: any;
  };
  message: string;
}

interface GenericResponse {
  message: string;
}

export const UserService = {
  // 登录
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    return axiosInstance.post('users/login', credentials);
  },

  // 注册
  register: async (userData: RegisterData): Promise<AuthResponse> => {
    return axiosInstance.post('users/register', userData);
  },

  // 获取当前用户信息
  getCurrentUser: async (): Promise<UserResponse> => {
    return axiosInstance.get('users/me');
  },

  // 更新用户信息
  updateUser: async (userData: any): Promise<UserResponse> => {
    return axiosInstance.put('users/me', userData);
  },

  // 更改密码
  changePassword: async (passwordData: { oldPassword: string; newPassword: string }): Promise<GenericResponse> => {
    return axiosInstance.put('users/change-password', passwordData);
  },

  // 注销
  logout: async (): Promise<GenericResponse> => {
    return axiosInstance.post('users/logout');
  }
};