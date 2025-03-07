package com.nowtrip.api.service.favorite;

import com.nowtrip.api.entity.Country;
import com.nowtrip.api.entity.Currency;
import com.nowtrip.api.entity.FavoriteCurrency;
import com.nowtrip.api.entity.User;
import com.nowtrip.api.repository.CurrencyRepository;
import com.nowtrip.api.repository.FavoriteCurrencyRepository;
import com.nowtrip.api.repository.UserRepository;
import com.nowtrip.api.response.currency.CurrencyResponse;
import com.nowtrip.api.service.auth.AuthenticationHelper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class FavoriteCurrencyService {
    private final FavoriteCurrencyRepository favoriteCurrencyRepository;
    private final UserRepository userRepository;
    private final CurrencyRepository currencyRepository;
    private final AuthenticationHelper authenticationHelper;

    private User getCurrentUser() {
        return authenticationHelper.getCurrentPrincipal().getUser();
    }

    // 즐겨찾기 추가
    @Transactional
    public void addFavoriteCurrency(Long currencyId) {
        User user = getCurrentUser();
        Currency currency = currencyRepository.findById(currencyId)
                .orElseThrow(() -> new IllegalArgumentException("통화를 찾을 수 없습니다: " + currencyId));

        // 이미 즐겨찾기 되어 있는지 확인
        if (favoriteCurrencyRepository.existsByUserIdAndCurrencyId(user.getId(), currencyId)) {
            throw new IllegalStateException("이미 즐겨찾기에 추가된 통화입니다.");
        }

        FavoriteCurrency favoriteCurrency = FavoriteCurrency.builder()
                .user(user)
                .currency(currency)
                .build();

        favoriteCurrencyRepository.save(favoriteCurrency);
    }

    // 즐겨찾기 제거
    @Transactional
    public void removeFavoriteCurrency(Long currencyId) {
        User user = getCurrentUser();

        if (!favoriteCurrencyRepository.existsByUserIdAndCurrencyId(user.getId(), currencyId)) {
            throw new IllegalArgumentException("즐겨찾기에 존재하지 않는 통화입니다.");
        }

        favoriteCurrencyRepository.deleteByUserIdAndCurrencyId(user.getId(), currencyId);
    }

    // 즐겨찾기한 통화 목록 조회
    public List<CurrencyResponse> getFavoriteCurrencies() {
        List<Currency> currencies = favoriteCurrencyRepository.findFavoriteCurrenciesByUserId(getCurrentUser().getId());

        List<CurrencyResponse> responses = currencies.stream().map(c -> CurrencyResponse.builder()
                .code(c.getCode())
                .koreanName(c.getKoreanName())
                .countryCodes(c.getCountries().stream().map(Country::getIso2Code).collect(Collectors.toList()))
                .flagCode(c.getCurrencyFlagCode())
                .build()).toList();

        return responses;
    }
}
