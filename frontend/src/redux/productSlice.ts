import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import * as productService from '../services/productService';

// ??????
import product1Image from '../assets/products/product-1-01.jpg';
import product2Image from '../assets/products/iflytek-1.jpg';
import product3Image from '../assets/products/buds3-1.jpg';
import product4Image from '../assets/products/product-4-01.jpg';
import product5Image from '../assets/products/5-1.jpg';
import product9Image from '../assets/products/tea-set-1.jpg';


// ???????? (????API??????)
const staticProductImages: Record<number, string> = {
  // 1: product1Image,
  // 2: product2Image,
  // 3: product3Image,
  // 4: product4Image,
  // 5: product5Image,
  // 9: product9Image,
  // 15: product5Image
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
  // ??????
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

// ??????
export const getProducts = createAsyncThunk<any, void>(
  'product/getProducts',
  async (_, { rejectWithValue }) => {
    try {
      const data = await productService.getProducts();
      return data;
    } catch (error: any) {
      return rejectWithValue(error.message || '????????');
    }
  }
);

// ????
export const addProduct = createAsyncThunk<any, any>(
  'product/addProduct',
  async (productData, { rejectWithValue }) => {
    try {
      const data = await productService.addProduct(productData);
      return data;
    } catch (error: any) {
      return rejectWithValue(error.message || '??????');
    }
  }
);

// ??????
export const getProduct = createAsyncThunk<any, number>(
  'product/getProduct',
  async (id, { rejectWithValue }) => {
    try {
      const data = await productService.getProduct(id);
      return data;
    } catch (error: any) {
      return rejectWithValue(error.message || '????????');
    }
  }
);

// ????
export const updateProduct = createAsyncThunk<any, { id: number; productData: any }>(
  'product/updateProduct',
  async ({ id, productData }, { rejectWithValue }) => {
    try {
      const data = await productService.updateProduct(id, productData);
      return data;
    } catch (error: any) {
      return rejectWithValue(error.message || '??????');
    }
  }
);

// ????
export const deleteProduct = createAsyncThunk<any, number>(
  'product/deleteProduct',
  async (id, { rejectWithValue }) => {
    try {
      console.log('??????ID:', id);
      const data = await productService.deleteProduct(id);
      console.log('??????ID:', id);
      return data;
    } catch (error: any) {
      console.error('??????ID:', id, '????:', error.message || '????');
      return rejectWithValue(error.message || '??????');
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
      // ??????
      .addCase(getProducts.pending, (state) => {
        state.loading = true;
      })
      .addCase(getProducts.fulfilled, (state, action) => {
        state.loading = false;
        let products = [];
        if (Array.isArray(action.payload)) {
          products = action.payload;
        } else {
          products = action.payload.products || [];
          state.pagination = action.payload.pagination || state.pagination;
        }
        
        // ????????
        state.products = products.map((product: Product) => {
          // ??????????
          if (staticProductImages[product.id]) {
            return {
              ...product,
              image: staticProductImages[product.id]
            };
          }
          // ????API?????
          else if (product.images && product.images.length > 0) {
            const primaryImage = product.images.find((img: { id: number; imageUrl: string; isPrimary: boolean }) => img.isPrimary);
            let imageUrl = primaryImage ? primaryImage.imageUrl : product.images[0].imageUrl;
            
            // ??????
            if (!imageUrl.startsWith('http')) {
              if (!imageUrl.startsWith('/public')) {
                if (imageUrl.startsWith('/products')) {
                  imageUrl = `/public${imageUrl}`;
                } else {
                  imageUrl = `/public/products${imageUrl}`;
                }
              }
              imageUrl = `${imageUrl}`;
            }
            
            return {
              ...product,
              image: imageUrl
            };
          }
          return product;
        });
      })
      .addCase(getProducts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // ????
      .addCase(addProduct.pending, (state) => {
        state.loading = true;
      })
      .addCase(addProduct.fulfilled, (state, action) => {
        state.loading = false;
        let newProduct = action.payload.product || action.payload;
        
        if (staticProductImages[newProduct.id]) {
          newProduct = {
            ...newProduct,
            image: staticProductImages[newProduct.id]
          };
        } else if (newProduct.images && newProduct.images.length > 0) {
          const primaryImage = newProduct.images.find((img: { id: number; imageUrl: string; isPrimary: boolean }) => img.isPrimary);
          let imageUrl = primaryImage ? primaryImage.imageUrl : newProduct.images[0].imageUrl;
          
          if (!imageUrl.startsWith('http')) {
            if (!imageUrl.startsWith('/public')) {
              if (imageUrl.startsWith('/products')) {
                imageUrl = `/public${imageUrl}`;
              } else {
                imageUrl = `/public/products${imageUrl}`;
              }
            }
            imageUrl = `${imageUrl}`;
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
      // ??????
      .addCase(getProduct.pending, (state) => {
        state.loading = true;
      })
      .addCase(getProduct.fulfilled, (state, action) => {
        state.loading = false;
        let product = action.payload;
        
        if (product.product) {
          product = product.product;
        }
        
        if (staticProductImages[product.id]) {
          product.image = staticProductImages[product.id];
        }
        else if (product.images && product.images.length > 0) {
          const primaryImage = product.images.find((img: { id: number; imageUrl: string; isPrimary: boolean }) => img.isPrimary);
          let imageUrl = primaryImage ? primaryImage.imageUrl : product.images[0].imageUrl;
          
          if (!imageUrl.startsWith('http')) {
            if (!imageUrl.startsWith('/public')) {
              if (imageUrl.startsWith('/products')) {
                imageUrl = `/public${imageUrl}`;
              } else {
                imageUrl = `/public/products${imageUrl}`;
              }
            }
            imageUrl = `${imageUrl}`;
          }
          
          product.image = imageUrl;
        }
        
        if (product.images && product.images.length > 0) {
          product.images = product.images.map((img: { id: number; imageUrl: string; isPrimary: boolean }) => {
            let imageUrl = img.imageUrl;
            
            if (!imageUrl.startsWith('http')) {
              if (!imageUrl.startsWith('/public')) {
                if (imageUrl.startsWith('/products')) {
                  imageUrl = `/public${imageUrl}`;
                } else {
                  imageUrl = `/public/products${imageUrl}`;
                }
              }
              imageUrl = `${imageUrl}`;
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
      // ????
      .addCase(updateProduct.pending, (state) => {
        state.loading = true;
      })
      .addCase(updateProduct.fulfilled, (state, action) => {
        state.loading = false;
        let updatedProduct = action.payload;
        
        if (staticProductImages[updatedProduct.id]) {
          updatedProduct = {
            ...updatedProduct,
            image: staticProductImages[updatedProduct.id]
          };
        } else if (updatedProduct.images && updatedProduct.images.length > 0) {
          const primaryImage = updatedProduct.images.find((img: { id: number; imageUrl: string; isPrimary: boolean }) => img.isPrimary);
          let imageUrl = primaryImage ? primaryImage.imageUrl : updatedProduct.images[0].imageUrl;
          
          if (!imageUrl.startsWith('http')) {
            if (!imageUrl.startsWith('/public')) {
              if (imageUrl.startsWith('/products')) {
                imageUrl = `/public${imageUrl}`;
              } else {
                imageUrl = `/public/products${imageUrl}`;
              }
            }
            imageUrl = `${imageUrl}`;
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
      // ????
      .addCase(deleteProduct.pending, (state) => {
        state.loading = true;
      })
      .addCase(deleteProduct.fulfilled, (state, action) => {
        state.loading = false;
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
