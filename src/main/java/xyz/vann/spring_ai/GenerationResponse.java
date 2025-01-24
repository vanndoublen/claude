package xyz.vann.spring_ai;

import lombok.Getter;
import lombok.Setter;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Getter
@Setter
@Service
class GenerationResponse {
    private String content;      // full response
    private String code;         // extracted code
    private String explanation;  // extracted explanation
    private Instant timestamp;
    private String status;

    public GenerationResponse parse(String rawContent) {
        GenerationResponse response = new GenerationResponse();
        response.setContent(rawContent);
        response.setTimestamp(Instant.now());
        response.setStatus("success");

        // Extract code between ```java and ```
        Pattern pattern = Pattern.compile("```java\\s*([\\s\\S]*?)```");
        Matcher matcher = pattern.matcher(rawContent);

        if (matcher.find()) {
            response.setCode(matcher.group(1).trim());
            // Split explanation and code
            String[] parts = rawContent.split("```java");
            if (parts.length > 0) {
                response.setExplanation(parts[0].trim());
            }
        } else {
            // If no code block found, treat entire content as explanation
            response.setExplanation(rawContent.trim());
        }

        return response;
    }
}