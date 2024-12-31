package com.nowtrip.api.initializer;

import com.nowtrip.api.service.exchageRate.ExchangeRateService;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

@Component
public class TestExchangeRateRunner implements CommandLineRunner {
    private final ExchangeRateService exchangeRateService;

    public TestExchangeRateRunner(ExchangeRateService exchangeRateService) {
        this.exchangeRateService = exchangeRateService;
    }

    @Override
    public void run(String... args) throws Exception {

        exchangeRateService.generateTestData();
    }
}
