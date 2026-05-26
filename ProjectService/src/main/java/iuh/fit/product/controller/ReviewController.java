package iuh.fit.product.controller;

import iuh.fit.product.entity.Product;
import iuh.fit.product.entity.Review;
import iuh.fit.product.repository.ProductRepository;
import iuh.fit.product.repository.ReviewRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/reviews")
@RequiredArgsConstructor
@CrossOrigin(origins = "*", maxAge = 3600)
public class ReviewController {

    private final ReviewRepository reviewRepository;
    private final ProductRepository productRepository;

    @PostMapping("/{productId}")
    public ResponseEntity<?> addReview(@PathVariable Long productId, @RequestBody Review review) {
        return productRepository.findById(productId)
                .map(product -> {
                    review.setProduct(product);
                    Review savedReview = reviewRepository.save(review);
                    return ResponseEntity.ok(savedReview);
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/product/{productId}")
    public ResponseEntity<List<Review>> getReviewsByProduct(@PathVariable Long productId) {
        List<Review> reviews = reviewRepository.findByProductId(productId);
        return ResponseEntity.ok(reviews);
    }
}
