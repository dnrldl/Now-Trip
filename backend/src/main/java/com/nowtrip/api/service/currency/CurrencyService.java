package com.nowtrip.api.service.currency;

import com.nowtrip.api.entity.Currency;
import com.nowtrip.api.repository.CurrencyRepository;
import com.nowtrip.api.response.currency.CurrencyResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CurrencyService {
    private final CurrencyRepository currencyRepository;

    public List<CurrencyResponse> getCurrencies() {
        List<Currency> currencies = currencyRepository.findAll();

        return currencies.stream().map(currency -> new CurrencyResponse(
                currency.getCode(),
                currency.getKoreanName(),
                currency.getCurrencyFlagCode()
        )).collect(Collectors.toList());
    }
}
