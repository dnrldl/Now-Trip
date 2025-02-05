package com.nowtrip.api.controller;

import com.nowtrip.api.response.exchange.ExchangeListResponse;
import com.nowtrip.api.response.exchange.ExchangeRateDetailsResponse;
import com.nowtrip.api.response.exchange.ExchangeResponse;
import com.nowtrip.api.service.exchageRate.ExchangeRateApiClient;
import com.nowtrip.api.service.exchageRate.ExchangeRateService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;

@RestController
@RequestMapping("/api/exchange")
@RequiredArgsConstructor
public class ExchangeRateController {
    private final ExchangeRateService exchangeRateService;
    private final ExchangeRateApiClient exchangeRateApiClient;

    @PostMapping
    public ResponseEntity<String> saveExchangeRates() {
        exchangeRateApiClient.fetchAndStoreExchangeRates();
        return ResponseEntity.ok("환율을 성공적으로 저장했습니다");
    }

    // 가장 최신의 환율 모두 반환
    @GetMapping
    public ResponseEntity<List<ExchangeResponse>> getExchangeRates() {
        List<ExchangeResponse> exchangeRates = exchangeRateService.getExchangeRates();
        return ResponseEntity.ok(exchangeRates);
    }

    @GetMapping("/list")
    public ResponseEntity<List<ExchangeListResponse>> getExchangeRateList() {
        List<ExchangeListResponse> responses = exchangeRateService.getExchangeRateList();
        return ResponseEntity.ok(responses);
    }

    // 가장 최신의 환율 반환
    @GetMapping("/{targetCurrency}")
    public ResponseEntity<ExchangeResponse> getExchangeRate(@PathVariable String targetCurrency) {
        ExchangeResponse exchangeRate = exchangeRateService.getExchangeRate(targetCurrency);
        return ResponseEntity.ok(exchangeRate);
    }

    // 특정 통화의 환율 기록 반환
    @GetMapping("/history-change")
    public ResponseEntity<ExchangeRateDetailsResponse> getExchangeRateHistoryWithChange(
            @RequestParam String targetCurrency,
            @RequestParam(defaultValue = "weekly") String filter) {
        ExchangeRateDetailsResponse exchangeHistory = exchangeRateService.getExchangeRateHistoryWithChange(
                targetCurrency, filter);
        return ResponseEntity.ok(exchangeHistory);
    }

    // 통화 변환
    @GetMapping("/convert")
    public ResponseEntity<BigDecimal> convertCurrency(
            @RequestParam String fromCurrency,
            @RequestParam String toCurrency,
            @RequestParam BigDecimal amount) {
        BigDecimal value = exchangeRateService.convertCurrency(fromCurrency, toCurrency, amount);
        return ResponseEntity.ok(value);
    }
}
