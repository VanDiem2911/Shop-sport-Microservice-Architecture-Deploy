package iuh.fit.order.service;

import iuh.fit.order.entity.CartItem;
import iuh.fit.order.repository.CartItemRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
@Transactional
public class CartService {

    @Autowired
    private CartItemRepository cartItemRepository;

    public List<CartItem> getCart(String username) {
        return cartItemRepository.findByUsername(username);
    }

    public CartItem addToCart(CartItem item) {
        List<CartItem> existing = cartItemRepository.findByUsernameAndProductIdAndSize(
                item.getUsername(), item.getProductId(), item.getSize()
        );

        if (!existing.isEmpty()) {
            CartItem cartItem = existing.get(0);
            cartItem.setQuantity(cartItem.getQuantity() + item.getQuantity());
            // Self-healing: Delete any other duplicate records if they exist
            for (int i = 1; i < existing.size(); i++) {
                cartItemRepository.delete(existing.get(i));
            }
            return cartItemRepository.save(cartItem);
        } else {
            return cartItemRepository.save(item);
        }
    }

    public void removeFromCart(String username, Long productId, String size) {
        List<CartItem> existing = cartItemRepository.findByUsernameAndProductIdAndSize(
                username, productId, size
        );
        if (!existing.isEmpty()) {
            cartItemRepository.deleteAll(existing);
        }
    }

    public void clearCart(String username) {
        cartItemRepository.deleteByUsername(username);
    }

    public List<CartItem> syncCart(String username, List<CartItem> localCart) {
        if (localCart == null || localCart.isEmpty()) {
            return getCart(username);
        }

        for (CartItem item : localCart) {
            item.setUsername(username);
            List<CartItem> existing = cartItemRepository.findByUsernameAndProductIdAndSize(
                    username, item.getProductId(), item.getSize()
            );

            if (!existing.isEmpty()) {
                CartItem dbItem = existing.get(0);
                // Merge quantities
                dbItem.setQuantity(Math.max(dbItem.getQuantity(), item.getQuantity()));
                // Self-healing: Delete any other duplicate records if they exist
                for (int i = 1; i < existing.size(); i++) {
                    cartItemRepository.delete(existing.get(i));
                }
                cartItemRepository.save(dbItem);
            } else {
                cartItemRepository.save(item);
            }
        }

        return getCart(username);
    }
}
