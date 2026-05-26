package iuh.fit.order.repository;

import iuh.fit.order.entity.CartItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CartItemRepository extends JpaRepository<CartItem, Long> {
    List<CartItem> findByUsername(String username);
    List<CartItem> findByUsernameAndProductIdAndSize(String username, Long productId, String size);
    void deleteByUsername(String username);
}
