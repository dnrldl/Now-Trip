package com.nowtrip.api.repository;

import com.nowtrip.api.entity.ExchangeRate;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface ExchangeRateRepository extends JpaRepository<ExchangeRate, Long> {
    Optional<ExchangeRate> findByTargetCurrency(String targetCurrency);
}
