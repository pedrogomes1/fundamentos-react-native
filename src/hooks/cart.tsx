import React, {
  createContext,
  useState,
  useCallback,
  useContext,
  useEffect,
} from 'react';

import AsyncStorage from '@react-native-community/async-storage';
import api from 'src/services/api';

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
}

const CartContext = createContext<CartContext | null>(null);

const CartProvider: React.FC = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    async function loadProducts(): Promise<void> {
      const allProducts = await AsyncStorage.getItem('@GoMarketPlace:cart');
      if (allProducts) {
        setProducts([...JSON.parse(allProducts)]);
      }
    }

    loadProducts();
  }, []);

  const addToCart = useCallback(
    async product => {
      const productId = products.findIndex(
        productItem => productItem.id === product.id,
      );

      const newProduct = { ...product, quantity: 1 };

      if (productId === -1) {
        setProducts([...products, newProduct]);

        await AsyncStorage.setItem(
          '@GoMarketPlace:cart',
          JSON.stringify([...products, newProduct]),
        );
      }
    },
    [products],
  );

  const increment = useCallback(
    async id => {
      const indexProduct = products.findIndex(product => product.id === id);

      if (indexProduct >= 0) {
        products[indexProduct].quantity += 1;

        setProducts([...products]);

        await AsyncStorage.setItem(
          '@GoMarketPlace:cart',
          JSON.stringify([...products]),
        );
      }
    },
    [products],
  );

  const decrement = useCallback(
    async id => {
      const indexProduct = products.findIndex(product => product.id === id);

      // if (products[indexProduct].quantity <= 1) {
      //   return;
      // }
      if (indexProduct >= 0) {
        products[indexProduct].quantity -= 1;

        setProducts([...products]); // Atualizo o estado

        await AsyncStorage.setItem(
          '@GoMarketPlace:cart',
          JSON.stringify([...products]),
        );
      }
    },
    [products],
  );

  const value = React.useMemo(
    () => ({ addToCart, increment, decrement, products }),
    [products, addToCart, increment, decrement],
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
