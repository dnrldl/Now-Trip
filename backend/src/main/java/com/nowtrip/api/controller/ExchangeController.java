package com.nowtrip.api.controller;

import com.nowtrip.api.service.exchageRate.ExchangeRateApiClient;
import com.nowtrip.api.service.exchageRate.ExchangeRateService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.Map;

@RestController
@RequestMapping("/api/exchange")
@RequiredArgsConstructor
public class ExchangeController {
    private final ExchangeRateService exchangeRateService;
    private final ExchangeRateApiClient exchangeRateApiClient;

    @GetMapping("/{targetCurrency}")
    public ResponseEntity<BigDecimal> getExchangeRate(@PathVariable String targetCurrency) {
        BigDecimal value = exchangeRateService.getExchangeRate(targetCurrency);
        return ResponseEntity.ok(value);
    }

    @PostMapping("/update")
    public ResponseEntity<String> updateExchangeRates() {
        Map<String, BigDecimal> rates = exchangeRateApiClient.fetchExchangeRates();
        exchangeRateService.saveOrUpdateExchangeRates(rates);
        return ResponseEntity.ok("환율을 성공적으로 저장했습니다");
    }

    /**
     * 통화 변환 API
     *
     * @param fromCurrency 기준 통화 (예: KRW)
     * @param toCurrency 대상 통화 (예: USD)
     * @param amount 변환 금액
     * @return 변환된 금액
     */
    @GetMapping("/convert")
    public ResponseEntity<BigDecimal> convertCurrency(
            @RequestParam String fromCurrency,
            @RequestParam String toCurrency,
            @RequestParam BigDecimal amount) {
        BigDecimal value = exchangeRateService.convertCurrency(fromCurrency, toCurrency, amount);
        return ResponseEntity.ok(value);
    }
}
