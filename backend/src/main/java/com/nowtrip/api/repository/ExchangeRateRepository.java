package com.nowtrip.api.repository;

import com.nowtrip.api.entity.ExchangeRate;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface ExchangeRateRepository extends JpaRepository<ExchangeRate, Long> {
    Optional<ExchangeRate> findByTargetCurrency(String targetCurrency);
    // 특정 대상 통화의 최신 환율을 시간순으로 정렬하여 반환
    List<ExchangeRate> findByTargetCurrencyOrderByLastUpdatedDesc(String targetCurrency);
    boolean existsByLastUpdated(LocalDateTime lastUpdated);
}
