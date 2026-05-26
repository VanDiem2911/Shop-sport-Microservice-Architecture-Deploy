package iuh.fit.product.controller;

import iuh.fit.product.entity.Product;
import iuh.fit.product.Service.ProductService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/products")
@CrossOrigin(origins = "*") // Cực kỳ quan trọng để React gọi được API
public class ProductController {
    @Autowired
    private ProductService productService;

    @PutMapping("/{id}/increment-sold")
    public Product incrementSoldCount(@PathVariable Long id, @RequestParam(defaultValue = "1") int quantity) {
        return productService.incrementSoldCount(id, quantity);
    }


    @GetMapping
    public List<Product> getAll() {
        return productService.getAllProducts();
    }

    @GetMapping("/{id}")
    public Product getById(@PathVariable Long id) {
        return productService.getProductById(id);
    }

    @GetMapping("/category")
    public List<Product> getByCategory(@RequestParam String name) {
        return productService.getProductsByCategory(name);
    }

    @PostMapping
    public Product createProduct(@RequestBody Product product) {
        return productService.saveProduct(product);
    }

    @PutMapping("/{id}")
    public Product updateProduct(@PathVariable Long id, @RequestBody Product productDetails) {
        Product product = productService.getProductById(id);
        if (product != null) {
            product.setName(productDetails.getName());
            product.setPrice(productDetails.getPrice());
            product.setImageUrl(productDetails.getImageUrl());
            product.setCategory(productDetails.getCategory());
            product.setSport(productDetails.getSport());
            product.setStock(productDetails.getStock());
            product.setDescription(productDetails.getDescription());
            return productService.saveProduct(product);
        }
        return null;
    }

    @PutMapping("/{id}/stock")
    public Product updateStock(@PathVariable Long id, @RequestParam int stock) {
        Product product = productService.getProductById(id);
        if (product != null) {
            product.setStock(stock);
            return productService.saveProduct(product);
        }
        return null;
    }

    @DeleteMapping("/{id}")
    public void deleteProduct(@PathVariable Long id) {
        productService.deleteProduct(id);
    }
}