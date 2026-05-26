package iuh.fit.product.repository;

import iuh.fit.product.entity.Product;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface ProductRepository extends JpaRepository<Product, Long> {

    // Tìm sản phẩm dựa trên THUỘC TÍNH 'name' bên trong đối tượng Category
    // JPA sẽ tự hiểu là: product.category.name = ?
    List<Product> findByCategoryName(String categoryName);

    // Nếu sau này bạn muốn tìm theo ID của Category thì dùng:
    List<Product> findByCategoryId(Long categoryId);
}