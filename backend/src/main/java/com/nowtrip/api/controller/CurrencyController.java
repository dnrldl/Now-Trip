package com.nowtrip.api.controller;

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

    @GetMapping
    public ResponseEntity<List<CurrencyResponse>> getCurrencies() {
        List<CurrencyResponse> responses = currencyService.getCurrencies();
        return ResponseEntity.ok(responses);
    }
}
