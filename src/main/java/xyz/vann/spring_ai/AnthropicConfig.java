package xyz.vann.spring_ai;

import org.springframework.ai.anthropic.AnthropicChatModel;
import org.springframework.ai.anthropic.AnthropicChatOptions;
import org.springframework.ai.anthropic.api.AnthropicApi;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.client.JdkClientHttpRequestFactory;
import org.springframework.web.client.RestClient;

import java.net.InetSocketAddress;
import java.net.ProxySelector;
import java.net.http.HttpClient;

@Configuration
public class AnthropicConfig {

    @Bean
    public RestClient restClient(@Value("${spring.ai.anthropic.api-key}") String apiKey) {
        HttpClient httpClient = HttpClient.newBuilder()
                .proxy(ProxySelector.of(new InetSocketAddress("127.0.0.1", 10809)))
                .build();

        return RestClient.builder()
                .requestFactory(new JdkClientHttpRequestFactory(httpClient))
//                .defaultHeader(HttpHeaders.AUTHORIZATION, "Bearer " + apiKey)
//                .defaultHeader("x-api-key", apiKey)
//                .defaultHeader("anthropic-version", "2023-06-01")
                .build();
    }

    @Bean
    public AnthropicApi anthropicApi(
            @Value("${spring.ai.anthropic.api-key}") String apiKey,
            RestClient restClient) {
        return new AnthropicApi(apiKey);
    }

    @Bean
    public AnthropicChatModel anthropicChatModel(AnthropicApi anthropicApi) {
        AnthropicChatOptions options = AnthropicChatOptions.builder()
                .model("claude-3-5-sonnet-20241022")
                .maxTokens(1000)
                .temperature(0.7)
                .build();

        return new AnthropicChatModel(anthropicApi, options);
    }
}