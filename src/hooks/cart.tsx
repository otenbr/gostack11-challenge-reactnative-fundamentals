import React, {
  createContext,
  useState,
  useCallback,
  useContext,
  useEffect,
} from 'react';

import AsyncStorage from '@react-native-community/async-storage';

interface Product {
  id: string;
  title: string;
  image_url: string;
  price: number;
  quantity: number;
}

interface CartContext {
  products: Product[];
  addToCart(item: Omit<Product, 'quantity'>): void;
  increment(id: string): void;
  decrement(id: string): void;
  clearCart?(): void;
}

const CartContext = createContext<CartContext | null>(null);

const CartProvider: React.FC = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    async function loadProducts(): Promise<void> {
      // TODO LOAD ITEMS FROM ASYNC STORAGE
      const prodsJson = await AsyncStorage.getItem('@GoMarket:products');

      if (prodsJson) {
        const prods = JSON.parse(prodsJson) as Product[];
        setProducts(prods);
      }
    }

    loadProducts();
  }, []);

  const clearCart = useCallback(async () => {
    setProducts([] as Product[]);

    await AsyncStorage.removeItem('@GoMarket:products');
  }, []);

  const increment = useCallback(
    async id => {
      // TODO INCREMENTS A PRODUCT QUANTITY IN THE CART
      const findIndex = products.findIndex(p => p.id === id);

      if (findIndex !== -1) {
        products[findIndex].quantity += 1;

        setProducts([...products]);

        await AsyncStorage.setItem(
          '@GoMarket:products',
          JSON.stringify(products),
        );
      }
    },
    [products],
  );

  const decrement = useCallback(
    async id => {
      // TODO DECREMENTS A PRODUCT QUANTITY IN THE CART
      const findIndex = products.findIndex(p => p.id === id);

      if (findIndex >= 0 && products[findIndex].quantity > 0) {
        products[findIndex].quantity -= 1;

        setProducts([...products]);

        await AsyncStorage.setItem(
          '@GoMarket:products',
          JSON.stringify(products),
        );
      }
    },
    [products],
  );

  const addToCart = useCallback(
    async product => {
      // TODO ADD A NEW ITEM TO THE CART
      const findIndex = products.findIndex(p => p.id === product.id);

      if (findIndex !== -1) {
        increment(product.id);
      } else {
        const newProduct = { ...product, quantity: 1 };

        await AsyncStorage.setItem(
          '@GoMarket:products',
          JSON.stringify([...products, newProduct]),
        );

        setProducts(oldValue => [...oldValue, newProduct]);
      }
    },
    [increment, products],
  );

  const value = React.useMemo(
    () => ({ addToCart, clearCart, increment, decrement, products }),
    [addToCart, clearCart, increment, decrement, products],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

function useCart(): CartContext {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error(`useCart must be used within a CartProvider`);
  }

  return context;
}

export { CartProvider, useCart };
