package xyz.vann.spring_ai;

import org.springframework.ai.chat.client.ChatClient;
import org.springframework.ai.chat.client.advisor.MessageChatMemoryAdvisor;
import org.springframework.ai.chat.memory.InMemoryChatMemory;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.ResponseBody;
import reactor.core.publisher.Flux;

import java.util.Map;

@Controller
public class ChatController {

    private final ChatClient chatClient;

    public ChatController(ChatClient.Builder chatClientBuilder) {
        this.chatClient = chatClientBuilder
                .defaultAdvisors(new MessageChatMemoryAdvisor(new InMemoryChatMemory()))
                .build();
    }

    @GetMapping("/chat")
    public String chatPage() {
        return "chat";
    }


    @PostMapping("/api/chat/stream")
    @ResponseBody
    public Flux<Map<String, String>> chatStream(@RequestBody Map<String, String> request) {
        try {
            String userMessage = request.get("message");

            String systemPrompt = "You are a programming assistant.\n" +
                    "Follow these rules for formatting:\n" +
                    "1. Code: Use ```language blocks\n" +
                    "2. Lists: Put blank lines between items\n";

            return chatClient.prompt()
                    .system(systemPrompt)
                    .user(userMessage)
                    .stream()
                    .content()
                    .map(content -> Map.of(
                            "message", content,
                            "status", "pending"
                    ))
                    .concatWith(Flux.just(Map.of(
                            "message", "",
                            "status", "complete"
                    )))
                    .onErrorResume(e -> {
                        e.printStackTrace();
                        return Flux.just(Map.of(
                                "message", "An error occurred: " + e.getMessage(),
                                "status", "error"
                        ));
                    });
        } catch (Exception e) {
            e.printStackTrace();
            return Flux.just(Map.of(
                    "message", "An error occurred: " + e.getMessage(),
                    "status", "error"
            ));
        }
    }




}