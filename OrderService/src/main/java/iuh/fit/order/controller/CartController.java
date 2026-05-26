package iuh.fit.order.controller;

import iuh.fit.order.entity.CartItem;
import iuh.fit.order.service.CartService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/orders/cart")
@RequiredArgsConstructor
@CrossOrigin(origins = "*", maxAge = 3600)
public class CartController {

    private final CartService cartService;

    @GetMapping
    public ResponseEntity<List<CartItem>> getCart(@RequestParam String username) {
        return ResponseEntity.ok(cartService.getCart(username));
    }

    @PostMapping
    public ResponseEntity<CartItem> addToCart(@RequestBody CartItem item) {
        return ResponseEntity.ok(cartService.addToCart(item));
    }

    @DeleteMapping
    public ResponseEntity<Void> removeFromCart(
            @RequestParam String username,
            @RequestParam Long productId,
            @RequestParam String size) {
        cartService.removeFromCart(username, productId, size);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/clear")
    public ResponseEntity<Void> clearCart(@RequestParam String username) {
        cartService.clearCart(username);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/sync")
    public ResponseEntity<List<CartItem>> syncCart(
            @RequestParam String username,
            @RequestBody List<CartItem> localCart) {
        return ResponseEntity.ok(cartService.syncCart(username, localCart));
    }
}
