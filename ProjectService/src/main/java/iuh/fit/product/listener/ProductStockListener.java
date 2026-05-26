package iuh.fit.product.listener;

import iuh.fit.product.Service.ProductService;
import iuh.fit.product.dto.StockUpdateEvent;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.amqp.rabbit.annotation.QueueBinding;
import org.springframework.amqp.rabbit.annotation.Queue;
import org.springframework.amqp.rabbit.annotation.Exchange;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

@Component
public class ProductStockListener {

    @Autowired
    private ProductService productService;

    @RabbitListener(bindings = @QueueBinding(
            value = @Queue(value = "q.product.stock-update", durable = "true"),
            exchange = @Exchange(value = "x.product.exchange", type = "topic"),
            key = "product.stock-update"
    ))
    public void handleStockUpdate(StockUpdateEvent event) {
        System.out.println("Received asynchronous stock update event via RabbitMQ: " + event);
        try {
            productService.incrementSoldCount(event.getProductId(), event.getQuantity());
            System.out.println("Successfully updated stock & sold count for Product ID " + event.getProductId() + " asynchronously!");
        } catch (Exception e) {
            System.err.println("Failed to process stock update event: " + e.getMessage());
        }
    }
}
