import React, { createContext, useState, useContext, useEffect } from "react";

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState(() => {
    try {
      const stored = localStorage.getItem("cart");
      return stored ? JSON.parse(stored) : [];
    } catch (e) {
      return [];
    }
  });

  // persist cart to localStorage whenever it changes
  useEffect(() => {
    try {
      localStorage.setItem("cart", JSON.stringify(cart));
    } catch (e) {
      // ignore
    }
  }, [cart]);

  // add one (or create with quantity 1)
  const addToCart = (product) => {
    setCart(prev => {
      const existing = prev.find(i => i.id === product.id);
      if (existing) {
        return prev.map(i =>
          i.id === product.id ? { ...i, quantity: i.quantity + 1 } : i
        );
      }
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  // decrease quantity by 1; remove item if quantity becomes 0
  const decreaseQuantity = (productId) => {
    setCart(prev => {
      return prev
        .map(i => i.id === productId ? { ...i, quantity: i.quantity - 1 } : i)
        .filter(i => i.quantity > 0);
    });
  };

  // remove item entirely
  const removeFromCart = (productId) => {
    setCart(prev => prev.filter(i => i.id !== productId));
  };

  const getCartCount = () => {
    return cart.reduce((sum, i) => sum + i.quantity, 0);
  };

  return (
    <CartContext.Provider value={{
      cart,
      setCart,
      addToCart,
      decreaseQuantity,
      removeFromCart,
      getCartCount
    }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
