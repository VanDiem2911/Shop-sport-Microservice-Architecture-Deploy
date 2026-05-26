package iuh.fit.product.Service;

import iuh.fit.product.entity.Product;
import iuh.fit.product.repository.ProductRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class ProductService {

    @Autowired
    private ProductRepository productRepository;

    @Cacheable(value = "products", key = "'all'")
    public List<Product> getAllProducts() {
        return productRepository.findAll();
    }

    @Cacheable(value = "products_by_category", key = "#categoryName")
    public List<Product> getProductsByCategory(String categoryName) {
        return productRepository.findByCategoryName(categoryName);
    }

    @Cacheable(value = "product_details", key = "#id")
    public Product getProductById(Long id) {
        return productRepository.findById(id).orElse(null);
    }

    @CacheEvict(value = {"products", "products_by_category", "product_details"}, allEntries = true)
    public Product saveProduct(Product product) {
        return productRepository.save(product);
    }

    @CacheEvict(value = {"products", "products_by_category", "product_details"}, allEntries = true)
    public void deleteProduct(Long id) {
        productRepository.deleteById(id);
    }

    @CacheEvict(value = {"products", "products_by_category", "product_details"}, allEntries = true)
    public Product incrementSoldCount(Long id, int quantity) {
        Product product = getProductById(id);
        if (product != null) {
            // Tăng số lượng đã bán
            product.setSoldQuantity((product.getSoldQuantity() != null ? product.getSoldQuantity() : 0) + quantity);
            
            // Trừ số lượng tồn kho (đảm bảo không bị âm)
            int currentStock = product.getStock() != null ? product.getStock() : 0;
            product.setStock(Math.max(0, currentStock - quantity));
            
            return productRepository.save(product);
        }
        return null;
    }
}