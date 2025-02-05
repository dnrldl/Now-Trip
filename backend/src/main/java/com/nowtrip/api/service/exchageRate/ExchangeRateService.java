package com.nowtrip.api.service.exchageRate;

import com.nowtrip.api.entity.ExchangeRate;
import com.nowtrip.api.entity.Post;
import com.nowtrip.api.repository.ExchangeRateRepository;
import com.nowtrip.api.response.exchange.ExchangeListResponse;
import com.nowtrip.api.response.exchange.ExchangeRateDetailsResponse;
import com.nowtrip.api.response.exchange.ExchangeResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.*;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.ThreadLocalRandom;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ExchangeRateService {
    private final ExchangeRateRepository exchangeRateRepository;
    private final ExchangeRateApiClient exchangeRateApiClient;

//    @Scheduled(cron = "0 0 1 * * ?", zone = "Asia/Seoul") // 하루 한 번 오전 1시 실행
    public void saveDailyExchangeRates() {
        exchangeRateApiClient.fetchAndStoreExchangeRates();
        System.out.println("환율 데이터를 성공적으로 저장했습니다: " + LocalDateTime.now());
    }

    // 환율의 최신 목록들 조회 (메인 페이지)
    public List<ExchangeListResponse> getExchangeRateList() {
        List<Object[]> results = exchangeRateRepository.findTopChangedRates();
        return results.stream()
                .map(obj -> new ExchangeListResponse(
                (String) obj[0], // currency
                (String) obj[1], // flagCode
                (String) obj[2], // koreanName
                (String) obj[3],
                (BigDecimal) obj[4], // rate (todayRate)
                obj[5] != null && ((BigDecimal) obj[5]).compareTo(BigDecimal.ZERO) != 0
                        ? ((BigDecimal) ((BigDecimal) obj[4]).subtract((BigDecimal) obj[5])).divide((BigDecimal) obj[5], 6, RoundingMode.HALF_UP).multiply(BigDecimal.valueOf(100))
                        : BigDecimal.ZERO // rateChangePercentage
        )).collect(Collectors.toList());
    }

    // 특정 통화의 시간별 환율 조회 (환율 상세 페이지)
    public ExchangeRateDetailsResponse getExchangeRateHistoryWithChange(String targetCurrency, String filter) {
        // 필터에 따라 구할 환율의 기간 지정
        LocalDate endDate = LocalDate.now();
        LocalDate startDate = switch (filter) {
            case "weekly" -> endDate.minusWeeks(1);
            case "monthly" -> endDate.minusMonths(3);
            case "yearly" -> endDate.minusYears(1);
            case "all" -> LocalDate.of(1970,1,1);
            default ->
                    endDate.minusWeeks(1);
        };

        List<ExchangeRate> exchangeRates = exchangeRateRepository.findRatesByPeriod(targetCurrency, startDate, endDate);

        if (exchangeRates.isEmpty())
            throw new IllegalArgumentException("환율 정보를 찾을 수 없습니다");

        List<ExchangeResponse> exchangeRateList = exchangeRates.stream()
                .map(rate -> new ExchangeResponse(
                        rate.getTargetCurrency(),
                        rate.getExchangeRate(),
                        rate.getLastUpdated()
                ))
                .toList();

        // 환율 변동 구하기
        ExchangeRate latestRate = exchangeRates.get(exchangeRates.size() - 1); // 최신 환율 (endDate)
        ExchangeRate previousRate = exchangeRates.get(0); // 과거 환율 (startDate)

        // 최신 환율 - 과거 환율
        BigDecimal rateChange = latestRate.getExchangeRate().subtract(previousRate.getExchangeRate()).setScale(2, RoundingMode.HALF_UP);
        BigDecimal rateChangePercentage = rateChange
                .multiply(BigDecimal.valueOf(100))
                .divide(previousRate.getExchangeRate(), 2, RoundingMode.HALF_UP);

        return new ExchangeRateDetailsResponse(
                exchangeRateList,
                rateChange,
                rateChangePercentage
        );
    }


    // 최신 환율 조회
    public ExchangeResponse getExchangeRate(String targetCurrency) {
        ExchangeRate exchangeRate = exchangeRateRepository.findTopByTargetCurrencyOrderByLastUpdatedDesc(targetCurrency)
                .orElseThrow(() -> new IllegalArgumentException("환율 정보를 찾을 수 없습니다"));


        return ExchangeResponse.builder()
                .targetCurrency(exchangeRate.getTargetCurrency())
                .exchangeRate(exchangeRate.getExchangeRate())
                .lastUpdated(exchangeRate.getLastUpdated())
                .build();
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

    // ex) KRW -> JPY
    public BigDecimal convertCurrency(String fromCurrency, String toCurrency, BigDecimal amount) {
        ExchangeRate fromRate = exchangeRateRepository.findTopByTargetCurrencyOrderByLastUpdatedDesc(fromCurrency)
                .orElseThrow(() -> new IllegalArgumentException(fromCurrency + " 환율 정보를 찾을 수 없습니다."));
        ExchangeRate toRate = exchangeRateRepository.findTopByTargetCurrencyOrderByLastUpdatedDesc(toCurrency)
                .orElseThrow(() -> new IllegalArgumentException(toCurrency + " 환율 정보를 찾을 수 없습니다."));

        BigDecimal from = fromRate.getExchangeRate();
        BigDecimal to = toRate.getExchangeRate();

        // 변환 계산: amount * (toRate / fromRate)
        BigDecimal conversionRate = to.divide(from, 6, RoundingMode.HALF_UP);
        return amount.multiply(conversionRate).setScale(2, RoundingMode.HALF_UP);
    }

    /**
     *  테스트 데이터 삽입
    **/

    public void generateTestData() {
        if (exchangeRateRepository.count() != 0)
            return;

        List<ExchangeRate> testRates = new ArrayList<>();

        LocalDate endDate = LocalDate.now();
        for (int i = 0; i < 730; i++) {
            // 아시아 11
            testRates.add(createExchangeRate("KRW", endDate.minusDays(i), 1400.0, 1500.0));
            testRates.add(createExchangeRate("JPY", endDate.minusDays(i), 120.0, 160.0));
            testRates.add(createExchangeRate("CNY", endDate.minusDays(i), 180.0, 220.0));
            testRates.add(createExchangeRate("THB", endDate.minusDays(i), 30.0, 40.0));
            testRates.add(createExchangeRate("VND", endDate.minusDays(i), 23000.0, 25000.0));
            testRates.add(createExchangeRate("PHP", endDate.minusDays(i), 50.0, 60.0));
            testRates.add(createExchangeRate("IDR", endDate.minusDays(i), 14000.0, 15000.0));
            testRates.add(createExchangeRate("SGD", endDate.minusDays(i), 1.3, 1.5));
            testRates.add(createExchangeRate("MYR", endDate.minusDays(i), 4.0, 5.0));
            testRates.add(createExchangeRate("HKD", endDate.minusDays(i), 7.0, 8.0));
            testRates.add(createExchangeRate("TWD", endDate.minusDays(i), 27.0, 30.0));

            // 유럽 4
            testRates.add(createExchangeRate("EUR", endDate.minusDays(i), 0.8, 1.2));
            testRates.add(createExchangeRate("GBP", endDate.minusDays(i), 0.7, 0.9));
            testRates.add(createExchangeRate("CHF", endDate.minusDays(i), 0.9, 1.1));
            testRates.add(createExchangeRate("TRY", endDate.minusDays(i), 7.0, 10.0));

            // 북미 2
            testRates.add(createExchangeRate("CAD", endDate.minusDays(i), 1.2, 1.5));
            testRates.add(createExchangeRate("MXN", endDate.minusDays(i), 19.0, 25.0));

            // 남미 1
            testRates.add(createExchangeRate("BRL", endDate.minusDays(i), 4.0, 5.5));

            // 오세아니아 2
            testRates.add(createExchangeRate("AUD", endDate.minusDays(i), 1.3, 1.8));
            testRates.add(createExchangeRate("NZD", endDate.minusDays(i), 1.4, 1.9));

            // 중동 및 아프리카 4
            testRates.add(createExchangeRate("AED", endDate.minusDays(i), 3.5, 4.0));
            testRates.add(createExchangeRate("ZAR", endDate.minusDays(i), 14.0, 18.0));
            testRates.add(createExchangeRate("EGP", endDate.minusDays(i), 15.0, 20.0));
            testRates.add(createExchangeRate("MAD", endDate.minusDays(i), 9.0, 11.0));
        }

        // 데이터 저장
        exchangeRateRepository.saveAll(testRates);
        System.out.println("대량의 테스트 데이터가 성공적으로 저장되었습니다");
    }

    private ExchangeRate createExchangeRate(String targetCurrency, LocalDate date, double minRate, double maxRate) {
        // 랜덤 환율 생성
        double randomRate = ThreadLocalRandom.current().nextDouble(minRate, maxRate);
        return ExchangeRate.builder()
                .targetCurrency(targetCurrency)
                .exchangeRate(BigDecimal.valueOf(randomRate))
                .lastUpdated(date)
                .build();
    }


}
