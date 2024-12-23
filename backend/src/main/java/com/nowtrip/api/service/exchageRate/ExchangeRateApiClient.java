package com.nowtrip.api.service.exchageRate;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.Map;

@Service
public class ExchangeRateApiClient {
    private final WebClient webClient;

    public ExchangeRateApiClient(WebClient.Builder webClientBuilder,
                                 @Value("${exchange.apikey}") String apikey) {
        this.webClient = webClientBuilder.baseUrl("https://v6.exchangerate-api.com/v6/" + apikey).build();
    }

    public Map<String, BigDecimal> fetchExchangeRates() {
       Map<String, BigDecimal> rawResponse = webClient.get()
               .uri("/latest/USD")
                .retrieve()
                .bodyToMono(Map.class) // Mono로 데이터를 비동기적으로 처리
                .block(); // 동기식으로 결과 반환

        Map<String, Object> rawRates = (Map<String, Object>) rawResponse.get("conversion_rates");
        Map<String, BigDecimal> rates = new HashMap<>();

        rawRates.forEach((key, value) -> {
            if (value instanceof Number) {
                rates.put(key, BigDecimal.valueOf(((Number) value).doubleValue()));
            } else {
                throw new IllegalArgumentException("지원하지 않는 데이터 타입: " + value.getClass());
            }
        });

        return rates;
    }
}
