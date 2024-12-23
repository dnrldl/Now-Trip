package com.nowtrip.api.service.exchageRate;

import lombok.RequiredArgsConstructor;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.util.Map;

@Component
@RequiredArgsConstructor
public class ExchangeRateUpdater {
    private final ExchangeRateApiClient exchangeRateApiClient;
    private final ExchangeRateService exchangeRateService;

    // 6시간마다 업데이트
//    @Scheduled(cron = "0 0 */6 * * ?")
//    public void baseCurrencyRates() {
//        String baseCurrency = "USD";
//        Map<String, BigDecimal> rates = exchangeRateApiClient.fetchExchangeRates(baseCurrency);
//        exchangeRateService.saveOrUpdateExchangeRates(baseCurrency, rates);
//    }
}
