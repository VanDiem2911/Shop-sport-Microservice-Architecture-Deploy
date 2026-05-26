import React, { createContext, useState, useContext, useEffect } from 'react';
import toast from 'react-hot-toast';
import cartApi from '../../api/cartApi';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
    // Local state for cart items
    const [cartItems, setCartItems] = useState([]);
    const [username, setUsername] = useState(() => localStorage.getItem('username'));

    // Listen to changes in authentication status
    useEffect(() => {
        const checkUser = () => {
            const currentUsername = localStorage.getItem('username');
            if (currentUsername !== username) {
                setUsername(currentUsername);
            }
        };
        window.addEventListener('storage', checkUser);
        const interval = setInterval(checkUser, 1000); // Check auth state periodically
        return () => {
            window.removeEventListener('storage', checkUser);
            clearInterval(interval);
        };
    }, [username]);

    // Fetch and Sync cart when user logs in or mounts
    useEffect(() => {
        if (username) {
            const localCart = JSON.parse(localStorage.getItem('cart') || '[]');
            // Convert localStorage items to CartItem format if needed
            const formattedLocalCart = localCart.map(item => ({
                username: username,
                productId: item.id,
                name: item.name,
                price: item.price,
                quantity: item.quantity,
                size: item.size,
                imageUrl: item.imageUrl
            }));

            cartApi.syncCart(username, formattedLocalCart)
                .then(res => {
                    // Update state with unified backend cart
                    setCartItems(res.data.map(item => ({
                        ...item,
                        id: item.productId // Keep product.id as item.id for UI compatibility
                    })));
                    localStorage.setItem('cart', '[]'); // Empty guest local storage
                })
                .catch(err => {
                    console.error("Error syncing persistent cart:", err);
                });
        } else {
            // Guest mode: Read directly from LocalStorage
            const savedCart = localStorage.getItem('cart');
            setCartItems(savedCart ? JSON.parse(savedCart) : []);
        }
    }, [username]);

    // Save cart to localStorage ONLY in guest mode
    useEffect(() => {
        if (!username) {
            localStorage.setItem('cart', JSON.stringify(cartItems));
        }
    }, [cartItems, username]);

    // Add to cart function
    const addToCart = async (product, size) => {
        if (username) {
            try {
                const itemToAdd = {
                    username: username,
                    productId: product.id,
                    name: product.name,
                    price: product.price,
                    quantity: 1,
                    size: size,
                    imageUrl: product.imageUrl
                };
                await cartApi.addToCart(itemToAdd);
                
                // Get fresh updated list from backend
                const res = await cartApi.getCart(username);
                setCartItems(res.data.map(item => ({
                    ...item,
                    id: item.productId
                })));
            } catch (error) {
                console.error("Error adding to backend cart:", error);
                toast.error("Không thể lưu giỏ hàng vào server!");
            }
        } else {
            // Guest mode
            setCartItems((prevItems) => {
                const isExist = prevItems.find(item => item.id === product.id && item.size === size);
                if (isExist) {
                    return prevItems.map(item =>
                        (item.id === product.id && item.size === size) ? { ...item, quantity: item.quantity + 1 } : item
                    );
                }
                return [...prevItems, { ...product, quantity: 1, size: size }];
            });
        }
        toast.success(`Đã thêm ${product.name} (Size: ${size}) vào giỏ hàng!`);
    };

    // Remove from cart function
    const removeFromCart = async (id, size) => {
        if (username) {
            try {
                await cartApi.removeFromCart(username, id, size);
                
                // Get fresh updated list from backend
                const res = await cartApi.getCart(username);
                setCartItems(res.data.map(item => ({
                    ...item,
                    id: item.productId
                })));
            } catch (error) {
                console.error("Error removing from backend cart:", error);
                toast.error("Không thể cập nhật giỏ hàng trên server!");
            }
        } else {
            // Guest mode
            setCartItems(prevItems => prevItems.filter(item => !(item.id === id && item.size === size)));
        }
        toast.error(`Đã xóa sản phẩm khỏi giỏ hàng`);
    };

    // Clear cart function
    const clearCart = async () => {
        if (username) {
            try {
                await cartApi.clearCart(username);
                setCartItems([]);
            } catch (error) {
                console.error("Error clearing backend cart:", error);
            }
        } else {
            setCartItems([]);
        }
    };

    return (
        <CartContext.Provider value={{ cartItems, addToCart, removeFromCart, clearCart }}>
            {children}
        </CartContext.Provider>
    );
};

export const useCart = () => useContext(CartContext);