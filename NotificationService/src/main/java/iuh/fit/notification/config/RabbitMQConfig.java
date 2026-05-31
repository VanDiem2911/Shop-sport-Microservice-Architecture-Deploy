package iuh.fit.notification.config;

import org.springframework.amqp.core.*;
import org.springframework.amqp.support.converter.Jackson2JsonMessageConverter;
import org.springframework.amqp.support.converter.MessageConverter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class RabbitMQConfig {

    public static final String PAYMENT_EXCHANGE = "x.payment.exchange";
    public static final String PAYMENT_QUEUE = "q.notification.payment-status";
    public static final String PAYMENT_ROUTING_KEY = "payment.status-update";

    public static final String ORDER_EXCHANGE = "x.order.exchange";
    public static final String ORDER_QUEUE = "q.notification.order-status";
    public static final String ORDER_ROUTING_KEY = "order.status-update";

    // Payment Queue configurations
    @Bean
    public TopicExchange paymentExchange() {
        return new TopicExchange(PAYMENT_EXCHANGE);
    }

    @Bean
    public Queue paymentStatusQueue() {
        return new Queue(PAYMENT_QUEUE, true);
    }

    @Bean
    public Binding paymentStatusBinding(Queue paymentStatusQueue, TopicExchange paymentExchange) {
        return BindingBuilder.bind(paymentStatusQueue).to(paymentExchange).with(PAYMENT_ROUTING_KEY);
    }

    // Order Queue configurations
    @Bean
    public TopicExchange orderExchange() {
        return new TopicExchange(ORDER_EXCHANGE);
    }

    @Bean
    public Queue orderStatusQueue() {
        return new Queue(ORDER_QUEUE, true);
    }

    @Bean
    public Binding orderStatusBinding(Queue orderStatusQueue, TopicExchange orderExchange) {
        return BindingBuilder.bind(orderStatusQueue).to(orderExchange).with(ORDER_ROUTING_KEY);
    }

    @Bean
    public MessageConverter jsonMessageConverter() {
        return new Jackson2JsonMessageConverter();
    }
}
