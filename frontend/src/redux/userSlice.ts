import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { UserService } from '../services/userService';

interface UserState {
  user: any | null;
  loading: boolean;
  error: string | null;
  isAuthenticated: boolean;
}

const initialState: UserState = {
  user: null,
  loading: false,
  error: null,
  isAuthenticated: false
};

// 登录异步action
export const login = createAsyncThunk(
  'user/login',
  async (credentials: { username: string; password: string }, { rejectWithValue }) => {
    try {
      console.log('Login thunk started with credentials:', credentials);
      const response = await UserService.login(credentials);
      console.log('Login response received:', response);
      if (!response || !response.token) {
        throw new Error('登录响应格式不正确');
      }
      localStorage.setItem('token', response.token);
      console.log('Token saved to localStorage');
      return response;
    } catch (error: any) {
      console.error('Login error:', error);
      return rejectWithValue(error.message || '登录失败');
    }
  }
)

// 注册异步action
export const register = createAsyncThunk(
  'user/register',
  async (userData: any, { rejectWithValue }) => {
    try {
      const response = await UserService.register(userData);
      if (!response || !response.token) {
        throw new Error('注册响应格式不正确');
      }
      localStorage.setItem('token', response.token);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message || '注册失败');
    }
  }
)

// 获取当前用户异步action
export const getCurrentUser = createAsyncThunk(
  'user/getCurrentUser',
  async (_, { rejectWithValue }) => {
    try {
      const response = await UserService.getCurrentUser();
      return response;
    } catch (error: any) {
      localStorage.removeItem('token');
      return rejectWithValue(error.message || '获取用户信息失败');
    }
  }
)

// 更新用户信息异步action
export const updateUser = createAsyncThunk(
  'user/updateUser',
  async (userData: any, { rejectWithValue }) => {
    try {
      const response = await UserService.updateUser(userData);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message || '更新用户信息失败');
    }
  }
)

// 更改密码异步action
export const changePassword = createAsyncThunk(
  'user/changePassword',
  async (passwordData: { oldPassword: string; newPassword: string }, { rejectWithValue }) => {
    try {
      const response = await UserService.changePassword(passwordData);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message || '更改密码失败');
    }
  }
);

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    logout: (state) => {
      state.user = null;
      state.isAuthenticated = false;
      localStorage.removeItem('token');
    }
  },
  extraReducers: (builder) => {
    // 登录
    builder
      .addCase(login.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.isAuthenticated = true;
        state.error = null;
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // 注册
    builder
      .addCase(register.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(register.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.isAuthenticated = true;
        state.error = null;
      })
      .addCase(register.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // 获取当前用户
    builder
      .addCase(getCurrentUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getCurrentUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.isAuthenticated = true;
        state.error = null;
      })
      .addCase(getCurrentUser.rejected, (state, action) => {
        state.loading = false;
        state.user = null;
        state.isAuthenticated = false;
        state.error = action.payload as string;
      });

    // 更新用户信息
    builder
      .addCase(updateUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.error = null;
      })
      .addCase(updateUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // 更改密码
    builder
      .addCase(changePassword.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(changePassword.fulfilled, (state) => {
        state.loading = false;
        state.error = null;
      })
      .addCase(changePassword.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  }
});

export const { clearError, logout } = userSlice.actions;
export default userSlice.reducer;