import { createSlice } from '@reduxjs/toolkit';

interface CartItem {
  id: number;
  productId: number;
  quantity: number;
  price: number;
  product: {
    id: number;
    name: string;
    price: number;
    discountPrice: number | null;
  };
}

interface CartState {
  cart: {
    id: number;
    totalAmount: number;
    items: CartItem[];
  } | null;
  loading: boolean;
  error: string | null;
}

const initialState: CartState = {
  cart: {
    id: 1,
    totalAmount: 0,
    items: []
  },
  loading: false,
  error: null
};

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    addToCart: (state, action) => {
      const { productId, quantity, product } = action.payload;
      
      // 检查商品是否已在购物车中
      const existingItemIndex = state.cart?.items.findIndex(item => item.productId === productId);
      
      if (existingItemIndex !== undefined && existingItemIndex >= 0 && state.cart) {
        // 如果商品已存在，增加数量
        state.cart.items[existingItemIndex].quantity += quantity;
      } else if (state.cart) {
        // 如果商品不存在，添加到购物车
        const newItem: CartItem = {
          id: Date.now(), // 临时ID
          productId,
          quantity,
          price: product.discountPrice || product.price,
          product: {
            id: product.id,
            name: product.name,
            price: product.price,
            discountPrice: product.discountPrice
          }
        };
        state.cart.items.push(newItem);
      }
      
      // 更新总金额
      if (state.cart) {
        state.cart.totalAmount = state.cart.items.reduce((sum, item) => {
          return sum + (item.price * item.quantity);
        }, 0);
      }
    },
    increaseQuantity: (state, action) => {
      const { itemId } = action.payload;
      if (state.cart) {
        const itemIndex = state.cart.items.findIndex(item => item.id === itemId);
        if (itemIndex >= 0) {
          state.cart.items[itemIndex].quantity += 1;
          // 更新总金额
          state.cart.totalAmount = state.cart.items.reduce((sum, item) => {
            return sum + (item.price * item.quantity);
          }, 0);
        }
      }
    },
    decreaseQuantity: (state, action) => {
      const { itemId } = action.payload;
      if (state.cart) {
        const itemIndex = state.cart.items.findIndex(item => item.id === itemId);
        if (itemIndex >= 0) {
          if (state.cart.items[itemIndex].quantity > 1) {
            state.cart.items[itemIndex].quantity -= 1;
            // 更新总金额
            state.cart.totalAmount = state.cart.items.reduce((sum, item) => {
              return sum + (item.price * item.quantity);
            }, 0);
          }
        }
      }
    },
    setQuantity: (state, action) => {
      const { itemId, quantity } = action.payload;
      if (state.cart && quantity >= 1) {
        const itemIndex = state.cart.items.findIndex(item => item.id === itemId);
        if (itemIndex >= 0) {
          state.cart.items[itemIndex].quantity = quantity;
          // 更新总金额
          state.cart.totalAmount = state.cart.items.reduce((sum, item) => {
            return sum + (item.price * item.quantity);
          }, 0);
        }
      }
    },
    removeFromCart: (state, action) => {
      const { itemId } = action.payload;
      if (state.cart) {
        // 从购物车中删除指定商品
        state.cart.items = state.cart.items.filter(item => item.id !== itemId);
        // 更新总金额
        state.cart.totalAmount = state.cart.items.reduce((sum, item) => {
          return sum + (item.price * item.quantity);
        }, 0);
      }
    },
    clearCart: (state) => {
      // 清空购物车
      if (state.cart) {
        state.cart.items = [];
        state.cart.totalAmount = 0;
      }
    }
  }
});

export const { clearError, addToCart, increaseQuantity, decreaseQuantity, setQuantity, removeFromCart, clearCart } = cartSlice.actions;
export default cartSlice.reducer;