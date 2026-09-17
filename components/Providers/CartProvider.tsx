"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";

export type CartItem = {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
  stock?: number;
};

type CartContextType = {
  items: CartItem[];
  addToCart: (item: CartItem) => void;
  removeFromCart: (id: string) => void;
  updateQuantity: (
    id: string,
    quantity: number
  ) => void;
  clearCart: () => void;
  totalItems: number;
  subtotal: number;
  isCartOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
};

const CartContext =
  createContext<CartContextType | null>(null);

export function CartProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);

  const openCart = () => setIsCartOpen(true);
  const closeCart = () => setIsCartOpen(false);

  // LOAD CART
  useEffect(() => {
    try {
      const savedCart =
        localStorage.getItem("raqei-cart");

      if (savedCart) {
        const parsedCart = JSON.parse(savedCart);

        if (Array.isArray(parsedCart)) {
          // Remove old size data from carts
          // saved before the size system was removed.
          const cleanedCart = parsedCart.map(
            (item) => {
              const {
                size,
                ...itemWithoutSize
              } = item;

              return itemWithoutSize;
            }
          );

          setItems(cleanedCart);
        }
      }
    } catch (error) {
      console.error(
        "Failed to load cart:",
        error
      );
    }
  }, []);

  // SAVE CART
  useEffect(() => {
    try {
      localStorage.setItem(
        "raqei-cart",
        JSON.stringify(items)
      );
    } catch (error) {
      console.error(
        "Failed to save cart:",
        error
      );
    }
  }, [items]);

  // ADD TO CART
  const addToCart = (item: CartItem) => {
    setItems((currentItems) => {
      const existingItem = currentItems.find(
        (cartItem) =>
          cartItem.id === item.id
      );

      if (existingItem) {
        const newQuantity =
          existingItem.quantity + item.quantity;

        const finalQuantity = item.stock
          ? Math.min(newQuantity, item.stock)
          : newQuantity;

        return currentItems.map((cartItem) =>
          cartItem.id === item.id
            ? {
                ...cartItem,
                quantity: finalQuantity,
                image:
                  item.image ?? cartItem.image,
                stock:
                  item.stock ?? cartItem.stock,
              }
            : cartItem
        );
      }

      const finalQuantity = item.stock
        ? Math.min(item.quantity, item.stock)
        : item.quantity;

      return [
        ...currentItems,
        {
          ...item,
          quantity: finalQuantity,
        },
      ];
    });
  };

  // REMOVE FROM CART
  const removeFromCart = (id: string) => {
    setItems((currentItems) =>
      currentItems.filter(
        (item) => item.id !== id
      )
    );
  };

  // UPDATE QUANTITY
  const updateQuantity = (
    id: string,
    quantity: number
  ) => {
    if (quantity <= 0) {
      removeFromCart(id);
      return;
    }

    setItems((currentItems) =>
      currentItems.map((item) => {
        if (item.id === id) {
          const finalQuantity = item.stock
            ? Math.min(quantity, item.stock)
            : quantity;

          return {
            ...item,
            quantity: finalQuantity,
          };
        }

        return item;
      })
    );
  };

  // CLEAR CART
  const clearCart = () => {
    setItems([]);
  };

  // TOTAL ITEMS
  const totalItems = items.reduce(
    (total, item) =>
      total + item.quantity,
    0
  );

  // SUBTOTAL
  const subtotal = items.reduce(
    (total, item) =>
      total +
      item.price * item.quantity,
    0
  );

  return (
    <CartContext.Provider
      value={{
        items,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        totalItems,
        subtotal,
        isCartOpen,
        openCart,
        closeCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error(
      "useCart must be used inside CartProvider"
    );
  }

  return context;
}