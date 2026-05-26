package iuh.fit.chat.controller;

import iuh.fit.chat.dto.ChatMessage;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/chats")
@RequiredArgsConstructor
@CrossOrigin(origins = "*", maxAge = 3600)
public class ChatController {

    private final ChatWebSocketHandler chatWebSocketHandler;

    @GetMapping("/history")
    public ResponseEntity<List<ChatMessage>> getChatHistory(@RequestParam String username) {
        return ResponseEntity.ok(chatWebSocketHandler.getHistoryForUser(username));
    }

    @GetMapping("/users")
    public ResponseEntity<List<String>> getChatUsers() {
        return ResponseEntity.ok(chatWebSocketHandler.getChatUsers());
    }
}
