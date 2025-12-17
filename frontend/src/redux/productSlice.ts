import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import * as productService from '../services/productService';

// 导入静态商品图片
import product1Image from '../assets/products/product-1-01.jpg';
import product2Image from '../assets/products/product-2-01.jpg';
import product3Image from '../assets/products/product-3-01.jpg';
import product4Image from '../assets/products/product-4-01.jpg';
import product5Image from '../assets/products/5-1.jpg';
import product9Image from '../assets/products/茶具套装.jpg';


// 静态商品图片映射
const staticProductImages: Record<number, string> = {
  1: product1Image,
  2: product2Image,
  3: product3Image,
  4: product4Image,
  5: product5Image,
  // 为ID 9添加静态图片映射
  9: product9Image,
  // 为ID 15添加静态图片映射，对应韩系穿搭高定轻奢水貂毛外套
  15: product5Image
};

interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  discountPrice: number | null;
  stock: number;
  status: string;
  viewCount: number;
  soldCount: number;
  categoryId: number;
  category?: {
    id: number;
    name: string;
  } | string;
  images?: {
    id: number;
    imageUrl: string;
    isPrimary: boolean;
  }[];
  // 添加image属性，用于兼容推荐商品对象
  image?: string;
}

interface ProductState {
  products: Product[];
  product: Product | null;
  categories: any[];
  loading: boolean;
  error: string | null;
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

const initialState: ProductState = {
  products: [],
  product: null,
  categories: [],
  loading: false,
  error: null,
  pagination: {
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 0
  }
};

// 异步thunk：获取商品列表
export const getProducts = createAsyncThunk<any, void>(
  'product/getProducts',
  async (_, { rejectWithValue }) => {
    try {
      const data = await productService.getProducts();
      return data;
    } catch (error: any) {
      return rejectWithValue(error.message || '获取商品列表失败');
    }
  }
);

// 异步thunk：添加商品
export const addProduct = createAsyncThunk<any, any>(
  'product/addProduct',
  async (productData, { rejectWithValue }) => {
    try {
      const data = await productService.addProduct(productData);
      return data;
    } catch (error: any) {
      return rejectWithValue(error.message || '添加商品失败');
    }
  }
);

// 异步thunk：获取单个商品
export const getProduct = createAsyncThunk<any, number>(
  'product/getProduct',
  async (id, { rejectWithValue }) => {
    try {
      const data = await productService.getProduct(id);
      return data;
    } catch (error: any) {
      return rejectWithValue(error.message || '获取商品详情失败');
    }
  }
);

// 异步thunk：更新商品
export const updateProduct = createAsyncThunk<any, { id: number; productData: any }>(
  'product/updateProduct',
  async ({ id, productData }, { rejectWithValue }) => {
    try {
      const data = await productService.updateProduct(id, productData);
      return data;
    } catch (error: any) {
      return rejectWithValue(error.message || '更新商品失败');
    }
  }
);

// 异步thunk：删除商品
export const deleteProduct = createAsyncThunk<any, number>(
  'product/deleteProduct',
  async (id, { rejectWithValue }) => {
    try {
      // 添加操作日志
      console.log('执行商品删除操作，商品ID:', id);
      const data = await productService.deleteProduct(id);
      console.log('商品删除成功，商品ID:', id);
      return data;
    } catch (error: any) {
      console.error('商品删除失败，商品ID:', id, '错误信息:', error.message || '未知错误');
      return rejectWithValue(error.message || '删除商品失败');
    }
  }
);

const productSlice = createSlice({
  name: 'product',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearProduct: (state) => {
      state.product = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // 获取商品列表
      .addCase(getProducts.pending, (state) => {
        state.loading = true;
      })
      .addCase(getProducts.fulfilled, (state, action) => {
        state.loading = false;
        // 检查返回数据结构，如果直接是商品数组则使用它，否则使用payload.products
        let products = [];
        if (Array.isArray(action.payload)) {
          products = action.payload;
        } else {
          products = action.payload.products || [];
          state.pagination = action.payload.pagination || state.pagination;
        }
        
        // 处理商品图片，为每个商品添加image字段，优先使用静态图片
        state.products = products.map((product: Product) => {
          // 优先使用静态图片映射中的图片
          if (staticProductImages[product.id]) {
            return {
              ...product,
              image: staticProductImages[product.id]
            };
          }
          // 如果没有静态图片，则使用API返回的图片
          else if (product.images && product.images.length > 0) {
            // 查找主要图片
            const primaryImage = product.images.find((img: { id: number; imageUrl: string; isPrimary: boolean }) => img.isPrimary);
            // 如果没有主要图片，则使用第一张图片
            let imageUrl = primaryImage ? primaryImage.imageUrl : product.images[0].imageUrl;
            
            // 确保图片URL指向后端服务器，包含完整的后端地址和/public前缀
            if (!imageUrl.startsWith('http')) {
              // 如果图片URL没有/public前缀，添加它
              if (!imageUrl.startsWith('/public')) {
                // 检查是否已经有/products前缀
                if (imageUrl.startsWith('/products')) {
                  imageUrl = `/public${imageUrl}`;
                } else {
                  // 如果没有任何前缀，添加完整路径
                  imageUrl = `/public/products${imageUrl}`;
                }
              }
              // 添加后端地址前缀
              imageUrl = `http://localhost:3001${imageUrl}`;
            }
            
            return {
              ...product,
              image: imageUrl
            };
          }
          // 如果没有images数组，则保持原有image字段不变
          return product;
        });
      })
      .addCase(getProducts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        // 如果API请求失败，保留当前商品列表（如果有）
      })
      // 添加商品
      .addCase(addProduct.pending, (state) => {
        state.loading = true;
      })
      .addCase(addProduct.fulfilled, (state, action) => {
        state.loading = false;
        // 检查返回数据结构，如果直接是商品对象则使用它，否则使用payload.product
        let newProduct = action.payload.product || action.payload;
        
        // 处理商品图片，为新添加的商品添加image字段，优先使用静态图片
        if (staticProductImages[newProduct.id]) {
          newProduct = {
            ...newProduct,
            image: staticProductImages[newProduct.id]
          };
        } else if (newProduct.images && newProduct.images.length > 0) {
          // 查找主要图片
          const primaryImage = newProduct.images.find((img: { id: number; imageUrl: string; isPrimary: boolean }) => img.isPrimary);
          // 如果没有主要图片，则使用第一张图片
          let imageUrl = primaryImage ? primaryImage.imageUrl : newProduct.images[0].imageUrl;
          
          // 确保图片URL指向后端服务器，包含完整的后端地址和/public前缀
          if (!imageUrl.startsWith('http')) {
            // 如果图片URL没有/public前缀，添加它
            if (!imageUrl.startsWith('/public')) {
              // 检查是否已经有/products前缀
              if (imageUrl.startsWith('/products')) {
                imageUrl = `/public${imageUrl}`;
              } else {
                // 如果没有任何前缀，添加完整路径
                imageUrl = `/public/products${imageUrl}`;
              }
            }
            // 添加后端地址前缀
            imageUrl = `http://localhost:3001${imageUrl}`;
          }
          
          newProduct = {
            ...newProduct,
            image: imageUrl
          };
        }
        
        state.products.push(newProduct);
        state.pagination.total += 1;
      })
      .addCase(addProduct.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // 获取单个商品
      .addCase(getProduct.pending, (state) => {
        state.loading = true;
      })
      .addCase(getProduct.fulfilled, (state, action) => {
        state.loading = false;
        let product = action.payload;
        
        // 如果返回的是包含product字段的对象，则取product字段
        if (product.product) {
          product = product.product;
        }
        
        // 处理商品图片，为商品添加image字段，优先使用静态图片
        // 优先使用静态图片映射中的图片
        if (staticProductImages[product.id]) {
          product.image = staticProductImages[product.id];
        }
        // 如果没有静态图片，则使用API返回的图片
        else if (product.images && product.images.length > 0) {
          // 查找主要图片
          const primaryImage = product.images.find((img: { id: number; imageUrl: string; isPrimary: boolean }) => img.isPrimary);
          // 如果没有主要图片，则使用第一张图片
          let imageUrl = primaryImage ? primaryImage.imageUrl : product.images[0].imageUrl;
          
          // 确保图片URL指向后端服务器，包含完整的后端地址和/public前缀
          if (!imageUrl.startsWith('http')) {
            // 如果图片URL没有/public前缀，添加它
            if (!imageUrl.startsWith('/public')) {
              // 检查是否已经有/products前缀
              if (imageUrl.startsWith('/products')) {
                imageUrl = `/public${imageUrl}`;
              } else {
                // 如果没有任何前缀，添加完整路径
                imageUrl = `/public/products${imageUrl}`;
              }
            }
            // 添加后端地址前缀
            imageUrl = `http://localhost:3001${imageUrl}`;
          }
          
          product.image = imageUrl;
        }
        
        // 处理images数组中的所有图片URL，确保它们都包含完整的后端地址
        if (product.images && product.images.length > 0) {
          product.images = product.images.map((img: { id: number; imageUrl: string; isPrimary: boolean }) => {
            let imageUrl = img.imageUrl;
            
            // 确保图片URL指向后端服务器，包含完整的后端地址和/public前缀
            if (!imageUrl.startsWith('http')) {
              // 如果图片URL没有/public前缀，添加它
              if (!imageUrl.startsWith('/public')) {
                // 检查是否已经有/products前缀
                if (imageUrl.startsWith('/products')) {
                  imageUrl = `/public${imageUrl}`;
                } else {
                  // 如果没有任何前缀，添加完整路径
                  imageUrl = `/public/products${imageUrl}`;
                }
              }
              // 添加后端地址前缀
              imageUrl = `http://localhost:3001${imageUrl}`;
            }
            
            return {
              ...img,
              imageUrl
            };
          });
        }
        
        state.product = product;
      })
      .addCase(getProduct.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // 更新商品
      .addCase(updateProduct.pending, (state) => {
        state.loading = true;
      })
      .addCase(updateProduct.fulfilled, (state, action) => {
        state.loading = false;
        let updatedProduct = action.payload;
        
        // 处理商品图片，为更新后的商品添加image字段，优先使用静态图片
        if (staticProductImages[updatedProduct.id]) {
          updatedProduct = {
            ...updatedProduct,
            image: staticProductImages[updatedProduct.id]
          };
        } else if (updatedProduct.images && updatedProduct.images.length > 0) {
          // 查找主要图片
          const primaryImage = updatedProduct.images.find((img: { id: number; imageUrl: string; isPrimary: boolean }) => img.isPrimary);
          // 如果没有主要图片，则使用第一张图片
          let imageUrl = primaryImage ? primaryImage.imageUrl : updatedProduct.images[0].imageUrl;
          
          // 确保图片URL指向后端服务器，包含完整的后端地址和/public前缀
          if (!imageUrl.startsWith('http')) {
            // 如果图片URL没有/public前缀，添加它
            if (!imageUrl.startsWith('/public')) {
              // 检查是否已经有/products前缀
              if (imageUrl.startsWith('/products')) {
                imageUrl = `/public${imageUrl}`;
              } else {
                // 如果没有任何前缀，添加完整路径
                imageUrl = `/public/products${imageUrl}`;
              }
            }
            // 添加后端地址前缀
            imageUrl = `http://localhost:3001${imageUrl}`;
          }
          
          updatedProduct = {
            ...updatedProduct,
            image: imageUrl
          };
        }
        
        const index = state.products.findIndex(product => product.id === updatedProduct.id);
        if (index !== -1) {
          state.products[index] = updatedProduct;
        }
      })
      .addCase(updateProduct.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // 删除商品
      .addCase(deleteProduct.pending, (state) => {
        state.loading = true;
      })
      .addCase(deleteProduct.fulfilled, (state, action) => {
        state.loading = false;
        // 使用传递给thunk的ID来删除商品
        state.products = state.products.filter(product => product.id !== Number(action.meta.arg));
        state.pagination.total -= 1;
      })
      .addCase(deleteProduct.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  }
});

export const { clearError, clearProduct } = productSlice.actions;
export default productSlice.reducer;