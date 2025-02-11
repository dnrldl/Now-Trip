package com.nowtrip.api.service.currency;

import com.nowtrip.api.entity.Country;
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
        List<Currency> currencies = currencyRepository.findAllWithCountries();

        return currencies.stream().map(currency -> new CurrencyResponse(
                currency.getCode(),
                currency.getKoreanName(),
                currency.getCurrencyFlagCode(),
                currency.getCountries().stream().map(Country::getIso2Code)
                        .collect(Collectors.toList())
        )).collect(Collectors.toList());
    }


}
