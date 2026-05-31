package iuh.fit.notification.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class OrderItemResponse {
    private Long id;
    private Long productId;
    private String name;
    private Double price;
    private Integer quantity;
    private String size;
    private String imageUrl;
}
