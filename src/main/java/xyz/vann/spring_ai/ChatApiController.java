package xyz.vann.spring_ai;

import org.springframework.ai.anthropic.AnthropicChatModel;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api")  // All API endpoints will be prefixed with /api
public class ChatApiController {

    private final AnthropicChatModel chatModel;
    private final ChatClient chatClient;
    private final GenerationResponse generationResponse;

    @Autowired
    public ChatApiController(AnthropicChatModel chatModel, ChatClient.Builder chatClientBuilder, GenerationResponse generationResponse) {
        this.chatModel = chatModel;
        this.chatClient = chatClientBuilder.build();
        this.generationResponse = generationResponse;
    }

    @GetMapping("/chat")
    public Map<String, Object> chat(@RequestParam String message) {
        try {
            String response = chatClient.prompt()
                    .user(message)
                    .call()
                    .content();

            return Map.of(
                    "message", response,
                    "status", "success"
            );
        } catch (Exception e) {
            return Map.of(
                    "message", "Error: " + e.getMessage(),
                    "status", "error"
            );
        }
    }

    @GetMapping("/chat/history")
    public List<Map<String, String>> getChatHistory() {
        return new ArrayList<>();
    }
}