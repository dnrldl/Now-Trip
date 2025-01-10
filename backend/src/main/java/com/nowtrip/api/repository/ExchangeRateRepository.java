package com.nowtrip.api.repository;

import com.nowtrip.api.entity.ExchangeRate;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface ExchangeRateRepository extends JpaRepository<ExchangeRate, Long> {
    Optional<ExchangeRate> findByTargetCurrency(String targetCurrency);
    // 특정 통화의 최신 환율을 반환
    Optional<ExchangeRate> findTopByTargetCurrencyOrderByLastUpdatedDesc(String targetCurrency);
    // 특정 대상 통화들의 최신 환율을 시간순으로 정렬하여 반환 (과거 -> 현재)
    List<ExchangeRate> findByTargetCurrencyOrderByLastUpdatedAsc(String targetCurrency);

    // 최신의 통화들의 환율을 반환
    @Query("SELECT e FROM ExchangeRate e WHERE e.lastUpdated = (" +
            "  SELECT MAX(sub.lastUpdated) " +
            "  FROM ExchangeRate sub " +
            "  WHERE sub.targetCurrency = e.targetCurrency" +
            ")")
    List<ExchangeRate> findLatestRates();
    boolean existsByLastUpdated(LocalDateTime lastUpdated);
}
