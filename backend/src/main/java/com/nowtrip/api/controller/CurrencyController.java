package com.nowtrip.api.controller;

import com.nowtrip.api.entity.Currency;
import com.nowtrip.api.repository.CurrencyRepository;
import com.nowtrip.api.response.currency.CurrencyResponse;
import com.nowtrip.api.service.currency.CurrencyService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/currency")
public class CurrencyController {
    private final CurrencyService currencyService;
    private final CurrencyRepository currencyRepository;

    @GetMapping
    public ResponseEntity<List<Currency>> getCurrencies() {
        List<CurrencyResponse> currencies = currencyService.getCurrencies();
        List<Currency> all = currencyRepository.findAll();
        return ResponseEntity.ok(all);
    }
}
