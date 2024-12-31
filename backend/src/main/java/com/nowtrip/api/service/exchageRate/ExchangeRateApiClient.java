package com.nowtrip.api.service.exchageRate;

import com.nowtrip.api.entity.ExchangeRate;
import com.nowtrip.api.repository.ExchangeRateRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.HashMap;
import java.util.Map;

@Service
public class ExchangeRateApiClient {
    private final WebClient webClient;
    private final ExchangeRateRepository exchangeRateRepository;

    public ExchangeRateApiClient(WebClient.Builder webClientBuilder, ExchangeRateRepository exchangeRateRepository,
                                 @Value("${exchange.apikey}") String apikey) {
        this.webClient = webClientBuilder.baseUrl("https://v6.exchangerate-api.com/v6/" + apikey).build();
        this.exchangeRateRepository = exchangeRateRepository;
    }

    public void fetchAndStoreExchangeRates() {
        // API 호출
        Map<String, Object> rawResponse = webClient.get()
                .uri("/latest/USD")
                .retrieve()
                .bodyToMono(new ParameterizedTypeReference<Map<String, Object>>() {})
                .block();

        // 응답 데이터 검증
        if (rawResponse == null || !rawResponse.containsKey("conversion_rates") || !rawResponse.containsKey("time_last_update_unix"))
            throw new IllegalStateException("유효하지 않은 환율 데이터 응답");


        // 시간 데이터 파싱
        long lastUpdateUnix = ((Number) rawResponse.get("time_last_update_unix")).longValue();
        LocalDateTime lastUpdated = LocalDateTime.ofInstant(Instant.ofEpochSecond(lastUpdateUnix), ZoneId.of("UTC"));

        // 중복 데이터 검증
        if (exchangeRateRepository.existsByLastUpdated(lastUpdated))
            throw new IllegalArgumentException("같은 날짜에 업데이트된 환율 데이터입니다");

        // 환율 데이터 추출
        Map<String, Object> rawRates = castToMap(rawResponse.get("conversion_rates"));

        // 환율 데이터 변환 및 저장
        rawRates.forEach((targetCurrency, rate) -> {
            if (rate instanceof Number) {
                ExchangeRate exchangeRate = ExchangeRate.builder()
                        .targetCurrency(targetCurrency)
                        .exchangeRate(BigDecimal.valueOf(((Number) rate).doubleValue()))
                        .lastUpdated(lastUpdated)
                        .build();

                exchangeRateRepository.save(exchangeRate);
            } else {
                throw new IllegalArgumentException("지원하지 않는 데이터 타입: " + rate.getClass());
            }
        });
    }

    @SuppressWarnings("unchecked")
    private Map<String, Object> castToMap(Object obj) {
        if (obj instanceof Map) {
            return (Map<String, Object>) obj;
        } else {
            throw new IllegalArgumentException("환율 데이터의 형식이 올바르지 않습니다: " + obj.getClass());
        }
    }
}
