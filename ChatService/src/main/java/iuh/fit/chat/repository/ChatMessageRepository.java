package iuh.fit.chat.repository;

import iuh.fit.chat.dto.ChatMessage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ChatMessageRepository extends JpaRepository<ChatMessage, Long> {

    List<ChatMessage> findAllByOrderByTimestampAsc();

    @Query("SELECT c FROM ChatMessage c WHERE " +
           "(c.sender = :username AND c.receiver = 'admin') OR " +
           "(c.sender = 'admin' AND c.receiver = :username) " +
           "ORDER BY c.timestamp ASC")
    List<ChatMessage> findHistoryForUser(@Param("username") String username);

    @Query("SELECT DISTINCT c.sender FROM ChatMessage c WHERE c.sender != 'admin'")
    List<String> findSenders();

    @Query("SELECT DISTINCT c.receiver FROM ChatMessage c WHERE c.receiver != 'admin'")
    List<String> findReceivers();
}
