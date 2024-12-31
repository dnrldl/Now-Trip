package com.nowtrip.api.service.exchageRate;

import com.nowtrip.api.entity.ExchangeRate;
import com.nowtrip.api.repository.ExchangeRateRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class ExchangeRateService {
    private final ExchangeRateRepository exchangeRateRepository;

    // 특정 통화의 시간별 환율 조회
    public List<ExchangeRate> getExchangeRateHistory(String targetCurrency) {
        return exchangeRateRepository.findByTargetCurrencyOrderByLastUpdatedDesc(targetCurrency);
    }

    // 환율 조회
    public BigDecimal getExchangeRate(String targetCurrency) {
        return exchangeRateRepository.findByTargetCurrency(targetCurrency)
                .map(ExchangeRate::getExchangeRate)
                .orElseThrow(() -> new IllegalArgumentException("환율 정보를 찾을 수 없습니다"));
    }

    /**
     * 통화 변환 메서드
     *
     * @param fromCurrency 기준 통화 코드 (예: KRW)
     * @param toCurrency 대상 통화 코드 (예: USD)
     * @param amount 변환하려는 금액 (예: 1000(KRW))
     * @return 변환된 금액
     */
    public BigDecimal convertCurrency(String fromCurrency, String toCurrency, BigDecimal amount) {
        ExchangeRate fromRate = exchangeRateRepository.findByTargetCurrency(fromCurrency)
                .orElseThrow(() -> new IllegalArgumentException(fromCurrency + " 환율 정보를 찾을 수 없습니다."));
        ExchangeRate toRate = exchangeRateRepository.findByTargetCurrency(toCurrency)
                .orElseThrow(() -> new IllegalArgumentException(toCurrency + " 환율 정보를 찾을 수 없습니다."));

        // 변환 계산: amount * (toRate / fromRate)
        BigDecimal from = fromRate.getExchangeRate();
        BigDecimal to = toRate.getExchangeRate();

        BigDecimal conversionRate = to.divide(from, 6, RoundingMode.HALF_UP);
        return amount.multiply(conversionRate).setScale(2, RoundingMode.HALF_UP);
    }
}
