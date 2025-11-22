import { createContext, useContext, useState, useEffect } from "react";

const CartContext = createContext();

export function CartProvider({ children }) {
  const [cart, setCart] = useState([]);
  const [products, setProducts] = useState([]);  // ✅ store all products for recommendation

  useEffect(() => {
    const savedCart = JSON.parse(localStorage.getItem("cart"));
    if (savedCart) setCart(savedCart);

  }, []);

  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(cart));

  }, [cart]);

  useEffect(() => {
    fetch("http://localhost:5000/api/products")
      .then((res) => res.json())
      .then((data) => setProducts(data))
      .catch((err) => console.error("Error loading products:", err));
  }, [cart]);

  const addToCart = (product, quantity) => {
    const existingItem = cart.find(item => item.id === product.id);

    // quantity param means add 1 more (from cart page +/-)
    if (quantity) {
      setCart(
        cart.map(item =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
      );
    }
    // already exists → increase by its own quantity
    else if (existingItem && product.quantity) {
      console.log("existing item hereeee")
      setCart(
        cart.map(item =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + product.quantity }
            : item
        )
      );
    }
    else if (existingItem){
      setCart(
        cart.map(item =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
      );
    }
    // brand-new product
    else {
      setCart([...cart, { ...product, quantity: product.quantity || 1 }]);
    }
  };

  const decreaseFromCart = (id) => {
    setCart(prev =>
      prev
        .map(item =>
          item.id === id
            ? { ...item, quantity: Math.max(item.quantity - 1, 0) }
            : item
        )
        .filter(item => item.quantity > 0)
    );
  };

  const removeFromCart = (id) => {
    setCart(prev => prev.filter(item => item.id !== id));
  };

  const getCartCount = () => {
    return cart.reduce((total, item) => total + item.quantity, 0);
  };

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        decreaseFromCart,
        removeFromCart,
        getCartCount,
        products,          
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => useContext(CartContext);
