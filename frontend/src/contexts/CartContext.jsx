import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState
} from 'react';
import { cartApi } from '../api/cartApi';
import { useAuth } from './AuthContext';

const CartContext = createContext(null);

const EMPTY_CART = {
  id: null,
  items: [],
  subtotal: '0.00'
};

const getErrorMessage = (error, fallback) => {
  return error?.message || fallback;
};

const getResponseData = (response) => {
  if (response?.success === false) {
    throw new Error(response.message || 'Cart request failed');
  }

  return response?.data || null;
};

const normalizeCart = (cart) => {
  if (!cart) {
    return EMPTY_CART;
  }

  return {
    ...cart,
    items: Array.isArray(cart.items) ? cart.items : [],
    subtotal: cart.subtotal ?? '0.00'
  };
};

export const CartProvider = ({ children }) => {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const [cart, setCart] = useState(EMPTY_CART);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState(null);
  const requestIdRef = useRef(0);

  const clearCart = useCallback(() => {
    requestIdRef.current += 1;
    setCart(EMPTY_CART);
    setError(null);
    setLoading(false);
    setActionLoading(false);
  }, []);

  const refreshCart = useCallback(async () => {
    if (authLoading) {
      return EMPTY_CART;
    }

    if (!isAuthenticated) {
      clearCart();
      return EMPTY_CART;
    }

    const requestId = requestIdRef.current + 1;
    requestIdRef.current = requestId;

    setLoading(true);
    setError(null);

    try {
      const response = await cartApi.getCart();
      const nextCart = normalizeCart(getResponseData(response));
      if (requestId === requestIdRef.current) {
        setCart(nextCart);
      }
      return nextCart;
    } catch (err) {
      const message = getErrorMessage(err, 'Không thể tải giỏ hàng');
      if (requestId === requestIdRef.current) {
        setError(message);
      }
      throw err;
    } finally {
      if (requestId === requestIdRef.current) {
        setLoading(false);
      }
    }
  }, [authLoading, clearCart, isAuthenticated]);

  useEffect(() => {
    if (authLoading) {
      return;
    }

    if (!isAuthenticated) {
      clearCart();
      return;
    }

    refreshCart().catch(() => {});
  }, [authLoading, clearCart, isAuthenticated, refreshCart]);

  const runCartMutation = useCallback(async (mutation, options = {}) => {
    if (authLoading) {
      const message = 'Giỏ hàng chưa sẵn sàng';
      setError(message);
      return { success: false, error: message };
    }

    if (!isAuthenticated) {
      const message = 'Vui lòng đăng nhập để quản lý giỏ hàng';
      setError(message);
      return { success: false, error: message };
    }

    setActionLoading(true);
    setError(null);

    try {
      const response = await mutation();
      const responseData = getResponseData(response);
      const returnedCart = options.useReturnedCart ? responseData?.cart : null;
      const nextCart = returnedCart
        ? normalizeCart(returnedCart)
        : await refreshCart();

      if (returnedCart) {
        requestIdRef.current += 1;
        setCart(nextCart);
      }

      return { success: true, data: nextCart, response };
    } catch (err) {
      const message = getErrorMessage(err, 'Không thể cập nhật giỏ hàng');
      setError(message);
      return { success: false, error: message };
    } finally {
      setActionLoading(false);
    }
  }, [authLoading, isAuthenticated, refreshCart]);

  const addItem = useCallback((productId, quantity = 1) => {
    return runCartMutation(() => cartApi.addCartItem({ productId, quantity }));
  }, [runCartMutation]);

  const updateItem = useCallback((cartItemId, quantity) => {
    return runCartMutation(() => cartApi.updateCartItem(cartItemId, quantity));
  }, [runCartMutation]);

  const updateItems = useCallback((items) => {
    return runCartMutation(
      () => cartApi.updateCartItems(items),
      { useReturnedCart: true }
    );
  }, [runCartMutation]);

  const removeItem = useCallback((cartItemId) => {
    return runCartMutation(() => cartApi.removeCartItem(cartItemId));
  }, [runCartMutation]);

  const itemCount = useMemo(() => {
    return cart.items.reduce((total, item) => total + (Number(item.quantity) || 0), 0);
  }, [cart.items]);

  const value = useMemo(() => ({
    cart,
    items: cart.items,
    subtotal: cart.subtotal,
    itemCount,
    hasItems: cart.items.length > 0,
    loading,
    actionLoading,
    error,
    refreshCart,
    addItem,
    updateItem,
    updateItems,
    removeItem,
    clearCart
  }), [
    actionLoading,
    addItem,
    cart,
    clearCart,
    error,
    itemCount,
    loading,
    refreshCart,
    removeItem,
    updateItem,
    updateItems
  ]);

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
