package iuh.fit.order.config;

import org.springframework.amqp.core.*;
import org.springframework.amqp.support.converter.Jackson2JsonMessageConverter;
import org.springframework.amqp.support.converter.MessageConverter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class RabbitMQConfig {
    public static final String QUEUE_NAME = "q.product.stock-update";
    public static final String EXCHANGE_NAME = "x.product.exchange";
    public static final String ROUTING_KEY = "product.stock-update";

    @Bean
    public Queue stockUpdateQueue() {
        return new Queue(QUEUE_NAME, true);
    }

    @Bean
    public TopicExchange productExchange() {
        return new TopicExchange(EXCHANGE_NAME);
    }

    @Bean
    public Binding binding(Queue stockUpdateQueue, TopicExchange productExchange) {
        return BindingBuilder.bind(stockUpdateQueue).to(productExchange).with(ROUTING_KEY);
    }

    @Bean
    public MessageConverter jsonMessageConverter() {
        return new Jackson2JsonMessageConverter();
    }
}
