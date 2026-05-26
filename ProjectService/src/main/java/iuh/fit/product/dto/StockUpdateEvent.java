package iuh.fit.product.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.io.Serializable;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class StockUpdateEvent implements Serializable {
    private static final long serialVersionUID = 1L;
    private Long productId;
    private Integer quantity;
}
