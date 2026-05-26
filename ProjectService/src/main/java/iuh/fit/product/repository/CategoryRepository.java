package iuh.fit.product.repository;

import iuh.fit.product.entity.Category;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface CategoryRepository extends JpaRepository<Category, Long> {
    // Bạn có thể thêm tìm kiếm theo tên nếu cần
    Category findByName(String name);
}