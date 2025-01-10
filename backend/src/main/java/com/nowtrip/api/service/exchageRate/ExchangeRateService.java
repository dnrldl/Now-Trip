package com.nowtrip.api.service.exchageRate;

import com.nowtrip.api.entity.ExchangeRate;
import com.nowtrip.api.repository.ExchangeRateRepository;
import com.nowtrip.api.response.exchange.ExchangeResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.scheduling.annotation.Scheduled;
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
    private final ExchangeRateApiClient exchangeRateApiClient;

    @Scheduled(cron = "0 0 1 * * ?", zone = "Asia/Seoul") // 하루 한 번 오전 1시 실행
    public void saveDailyExchangeRates() {
        exchangeRateApiClient.fetchAndStoreExchangeRates();
        System.out.println("환율 데이터를 성공적으로 저장했습니다: " + LocalDateTime.now());
    }

    // 특정 통화의 시간별 환율 조회
    public List<ExchangeResponse> getExchangeRateHistory(String targetCurrency) {
        List<ExchangeRate> exchangeRates = exchangeRateRepository.findByTargetCurrencyOrderByLastUpdatedAsc(targetCurrency);

        if (exchangeRates.isEmpty())
            throw new IllegalArgumentException("환율 정보를 찾을 수 없습니다");

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

    public List<ExchangeResponse> getExchangeRates() {
        List<ExchangeRate> exchangeRates = exchangeRateRepository.findLatestRates();
        if (exchangeRates.isEmpty())
            throw new IllegalArgumentException("환율 정보를 찾을 수 없습니다");

        return exchangeRates.stream()
                .map(rate -> new ExchangeResponse(
                        rate.getTargetCurrency(),
                        rate.getExchangeRate(),
                        rate.getLastUpdated()
                ))
                .collect(Collectors.toList());
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

        LocalDateTime startDate = LocalDateTime.of(2024, 1, 1, 0, 0, 0);
        for (int i = 0; i < 30; i++) {
            testRates.add(createExchangeRate("KRW", startDate.plusDays(i), 1200.0, 1500.0));
            testRates.add(createExchangeRate("JPY", startDate.plusDays(i), 100.0, 160.0));
            testRates.add(createExchangeRate("CNY", startDate.plusDays(i), 170.0, 220.0));
            testRates.add(createExchangeRate("THB", startDate.plusDays(i), 30.0, 40.0));
            testRates.add(createExchangeRate("VND", startDate.plusDays(i), 20000.0, 25000.0));
            testRates.add(createExchangeRate("PHP", startDate.plusDays(i), 50.0, 60.0));
            testRates.add(createExchangeRate("IDR", startDate.plusDays(i), 14000.0, 15000.0));
            testRates.add(createExchangeRate("SGD", startDate.plusDays(i), 1.3, 1.5));
            testRates.add(createExchangeRate("MYR", startDate.plusDays(i), 4.0, 5.0));
            testRates.add(createExchangeRate("HKD", startDate.plusDays(i), 7.0, 8.0));
            testRates.add(createExchangeRate("TWD", startDate.plusDays(i), 27.0, 30.0));

            // 유럽
            testRates.add(createExchangeRate("EUR", startDate.plusDays(i), 0.8, 1.2));
            testRates.add(createExchangeRate("GBP", startDate.plusDays(i), 0.7, 0.9));
            testRates.add(createExchangeRate("CHF", startDate.plusDays(i), 0.9, 1.1));
            testRates.add(createExchangeRate("TRY", startDate.plusDays(i), 7.0, 10.0));

            // 북미
            testRates.add(createExchangeRate("CAD", startDate.plusDays(i), 1.2, 1.5));
            testRates.add(createExchangeRate("MXN", startDate.plusDays(i), 19.0, 25.0));

            // 남미
            testRates.add(createExchangeRate("BRL", startDate.plusDays(i), 4.0, 5.5));

            // 오세아니아
            testRates.add(createExchangeRate("AUD", startDate.plusDays(i), 1.3, 1.8));
            testRates.add(createExchangeRate("NZD", startDate.plusDays(i), 1.4, 1.9));

            // 중동 및 아프리카
            testRates.add(createExchangeRate("AED", startDate.plusDays(i), 3.5, 4.0));
            testRates.add(createExchangeRate("ZAR", startDate.plusDays(i), 14.0, 18.0));
            testRates.add(createExchangeRate("EGP", startDate.plusDays(i), 15.0, 20.0));
            testRates.add(createExchangeRate("MAD", startDate.plusDays(i), 9.0, 11.0));
        }

        // 데이터 저장
        exchangeRateRepository.saveAll(testRates);
        System.out.println("대량의 테스트 데이터가 성공적으로 저장되었습니다");
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
