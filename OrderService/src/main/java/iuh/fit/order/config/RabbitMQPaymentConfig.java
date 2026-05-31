package iuh.fit.order.config;

import org.springframework.amqp.core.*;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class RabbitMQPaymentConfig {

    public static final String ORDER_EXCHANGE = "x.order.exchange";
    public static final String ORDER_ROUTING_KEY = "order.status-update";

    public static final String PAYMENT_EXCHANGE = "x.payment.exchange";
    public static final String PAYMENT_QUEUE = "q.order.payment-status";
    public static final String PAYMENT_ROUTING_KEY = "payment.status-update";

    // Beans for publishing order status events
    @Bean
    public TopicExchange orderExchange() {
        return new TopicExchange(ORDER_EXCHANGE);
    }

    // Beans for consuming payment status events
    @Bean
    public Queue paymentStatusQueue() {
        return new Queue(PAYMENT_QUEUE, true);
    }

    @Bean
    public TopicExchange paymentExchange() {
        return new TopicExchange(PAYMENT_EXCHANGE);
    }

    @Bean
    public Binding paymentStatusBinding(Queue paymentStatusQueue, TopicExchange paymentExchange) {
        return BindingBuilder.bind(paymentStatusQueue).to(paymentExchange).with(PAYMENT_ROUTING_KEY);
    }
}
