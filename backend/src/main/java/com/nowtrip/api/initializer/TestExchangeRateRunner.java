package com.nowtrip.api.initializer;

import com.nowtrip.api.service.exchageRate.ExchangeRateService;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class TestExchangeRateRunner implements CommandLineRunner {
    private final ExchangeRateService exchangeRateService;

    @Override
    public void run(String... args) throws Exception {
        exchangeRateService.generateTestData();
    }
}
