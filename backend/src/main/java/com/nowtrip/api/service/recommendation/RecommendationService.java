package com.nowtrip.api.service.recommendation;

import com.nowtrip.api.entity.Country;
import com.nowtrip.api.entity.ExchangeRate;
import com.nowtrip.api.repository.CountryRepository;
import com.nowtrip.api.repository.ExchangeRateRepository;
import com.nowtrip.api.response.recommendation.RecommendationResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class RecommendationService {
    private final ExchangeRateRepository exchangeRateRepository;
    private final CountryRepository countryRepository;

    public List<RecommendationResponse> recommendDestinations(BigDecimal budgetInKRW) {
        // 최신 KRW → USD 환율 가져오기
        Optional<ExchangeRate> krwToUsdRateOpt = exchangeRateRepository.findTopByTargetCurrencyOrderByLastUpdatedDesc("KRW");
        if (krwToUsdRateOpt.isEmpty()) throw new IllegalArgumentException("KRW 환율 정보를 찾을 수 없습니다.");

        BigDecimal krwToUsdRate = krwToUsdRateOpt.get().getExchangeRate();

        // 입력된 KRW 예산을 USD로 변환 e.g. 100,000 KRW / 1,300 (환율) = 76.92 USD
        BigDecimal budgetInUSD = budgetInKRW.divide(krwToUsdRate, 6, RoundingMode.HALF_UP);

        // 모든 최신 환율을 가져와서 USD 기준 변환
        List<ExchangeRate> latestRates = exchangeRateRepository.findLatestRates();

        // 모든 Country를 한 번의 쿼리로 조회하여 Map으로 변환 (Key: currencyCode, Value: Country 리스트)
        Map<String, List<Country>> countryMap = countryRepository.findAll()
                .stream()
                .collect(Collectors.groupingBy(country -> country.getCurrency().getCode()));

        List<RecommendationResponse> recommendations = new ArrayList<>();

        for (ExchangeRate rate : latestRates) {
            // USD → targetCurrency 변환
            BigDecimal localBudget = budgetInUSD.multiply(rate.getExchangeRate()).setScale(2, RoundingMode.HALF_UP);

            // 특정 currencyCode에 해당하는 Country 리스트 가져오기 (없으면 빈 리스트 반환)
            List<Country> countries = countryMap.getOrDefault(rate.getTargetCurrency(), Collections.emptyList());

            // 여러 개의 국가가 조회될 경우 각각 추가
            for (Country country : countries) {
                recommendations.add(new RecommendationResponse(
                        country.getKoreanName(),
                        country.getIso2Code(),
                        country.getCurrency().getCode(),
                        localBudget,
                        rate.getExchangeRate()
                ));
            }
        }

        // 예산 대비 가성비 높은 순으로 정렬
        recommendations.sort((a, b) -> b.getLocalBudget().compareTo(a.getLocalBudget()));

        return recommendations;
    }

}
