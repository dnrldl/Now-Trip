package com.nowtrip.api.service.exchageRate;

import com.nowtrip.api.entity.ExchangeRate;
import com.nowtrip.api.repository.ExchangeRateRepository;
import com.nowtrip.api.response.exchange.ExchangeResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ThreadLocalRandom;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ExchangeRateService {
    private final ExchangeRateRepository exchangeRateRepository;

    // 특정 통화의 시간별 환율 조회
    public List<ExchangeResponse> getExchangeRateHistory(String targetCurrency) {
        List<ExchangeRate> exchangeRates = exchangeRateRepository.findByTargetCurrencyOrderByLastUpdatedAsc(targetCurrency);

        if (exchangeRates.isEmpty())
            throw new IllegalArgumentException("환율 정보가 없습니다");

        return exchangeRates.stream()
                .map(rate -> new ExchangeResponse(
                        rate.getTargetCurrency(),
                        rate.getExchangeRate(),
                        rate.getLastUpdated()
                ))
                .collect(Collectors.toList());
    }

    // 최신 환율 조회
    public ExchangeResponse getExchangeRate(String targetCurrency) {
        ExchangeRate exchangeRate = exchangeRateRepository.findTopByTargetCurrencyOrderByLastUpdatedDesc(targetCurrency)
                .orElseThrow(() -> new IllegalArgumentException("환율 정보를 찾을 수 없습니다"));

        ExchangeResponse res = ExchangeResponse.builder()
                .targetCurrency(exchangeRate.getTargetCurrency())
                .exchangeRate(exchangeRate.getExchangeRate())
                .lastUpdated(exchangeRate.getLastUpdated())
                .build();

        return res;
    }

    /**
     * 최신 환율 변환 메서드
     *
     * @param fromCurrency 기준 통화 코드 (예: KRW)
     * @param toCurrency   대상 통화 코드 (예: USD)
     * @param amount       변환하려는 금액 (예: 1000(KRW))
     * @return 변환된 금액
     */
    public BigDecimal convertCurrency(String fromCurrency, String toCurrency, BigDecimal amount) {
        ExchangeRate fromRate = exchangeRateRepository.findTopByTargetCurrencyOrderByLastUpdatedDesc(fromCurrency)
                .orElseThrow(() -> new IllegalArgumentException(fromCurrency + " 환율 정보를 찾을 수 없습니다."));
        ExchangeRate toRate = exchangeRateRepository.findTopByTargetCurrencyOrderByLastUpdatedDesc(toCurrency)
                .orElseThrow(() -> new IllegalArgumentException(toCurrency + " 환율 정보를 찾을 수 없습니다."));

        // 변환 계산: amount * (toRate / fromRate)
        BigDecimal from = fromRate.getExchangeRate();
        BigDecimal to = toRate.getExchangeRate();

        BigDecimal conversionRate = to.divide(from, 6, RoundingMode.HALF_UP);
        return amount.multiply(conversionRate).setScale(2, RoundingMode.HALF_UP);
    }

    // 테스트 데이터 삽입
    public void generateTestData() {
        if (exchangeRateRepository.count() != 0)
            return;

        List<ExchangeRate> testRates = new ArrayList<>();

        // 1년간의 데이터를 생성 (예: 365일)
        LocalDateTime startDate = LocalDateTime.of(2024, 1, 1, 0, 0, 0);
        for (int i = 0; i < 365; i++) {
            // 한국(KRW) 환율 생성
            testRates.add(createExchangeRate("KRW", startDate.plusDays(i), 1200.0, 1500.0));

            // 일본(JPY) 환율 생성
            testRates.add(createExchangeRate("JPY", startDate.plusDays(i), 100.0, 160.0));
        }

        // 데이터 저장
        exchangeRateRepository.saveAll(testRates);
        System.out.println("대량의 테스트 데이터가 성공적으로 저장되었습니다.");
    }

    private ExchangeRate createExchangeRate(String targetCurrency, LocalDateTime date, double minRate, double maxRate) {
        // 랜덤 환율 생성
        double randomRate = ThreadLocalRandom.current().nextDouble(minRate, maxRate);
        return ExchangeRate.builder()
                .targetCurrency(targetCurrency)
                .exchangeRate(BigDecimal.valueOf(randomRate))
                .lastUpdated(date)
                .build();
    }
}
