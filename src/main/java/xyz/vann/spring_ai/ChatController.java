package xyz.vann.spring_ai;

import org.springframework.ai.chat.client.ChatClient;
import org.springframework.ai.chat.model.ChatResponse;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.ResponseBody;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Controller
public class ChatController {

    private final ChatClient chatClient;

    public ChatController(ChatClient.Builder chatClientBuilder) {
        this.chatClient = chatClientBuilder.build();
    }

    @GetMapping("/chat")
    public String chatPage() {
        return "chat";
    }

    @PostMapping("/api/chat")
    @ResponseBody
    public Map<String, String> chat(@RequestBody Map<String, Object> request) {
        String userMessage = (String) request.get("message");
        List<Map<String, String>> history = (List<Map<String, String>>) request.get("history");

        StringBuilder contextBuilder = new StringBuilder();
        if (history != null) {
            for (Map<String, String> msg : history) {
                if ("user".equals(msg.get("role"))) {
                    contextBuilder.append("User: ").append(msg.get("content")).append("\n");
                } else if ("assistant".equals(msg.get("role"))) {
                    contextBuilder.append("Assistant: ").append(msg.get("content")).append("\n");
                }
            }
        }

        // Modified system prompt to encourage complete responses
        String systemPrompt = "You are a programming assistant." +
                "Follow these rules for formatting:\n" +
                "1. Code: Use ```language blocks\n" +
                "2. Lists: Put blank lines between items\n\n" +

                "Previous conversation:\n" + contextBuilder.toString();

        ChatResponse response = chatClient.prompt()
                .system(systemPrompt)
                .user(userMessage)
                .call()
                .chatResponse();

        String aiResponse = response.getResults().get(0).getOutput().getContent();
        aiResponse = aiResponse.replaceAll("(?<=\\$[^$]*)(\\\\)(?=[^$]*\\$)", "\\\\\\\\");

        Map<String, String> result = new HashMap<>();
        result.put("status", "success");
        result.put("message", aiResponse);

        return result;
    }
}