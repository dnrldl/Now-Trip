package com.nowtrip.api.repository;

import com.nowtrip.api.entity.ExchangeRate;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface ExchangeRateRepository extends JpaRepository<ExchangeRate, Long> {
    Optional<ExchangeRate> findByTargetCurrency(String targetCurrency);
    // 특정 통화의 최신 환율을 반환
    Optional<ExchangeRate> findTopByTargetCurrencyOrderByLastUpdatedDesc(String targetCurrency);
    // 특정 대상 통화들의 최신 환율을 시간순으로 정렬하여 반환 (과거 -> 현재)
    List<ExchangeRate> findByTargetCurrencyOrderByLastUpdatedAsc(String targetCurrency);

    // 최신의 통화들의 환율을 반환
    @Query("SELECT e FROM ExchangeRate e " +
            "WHERE (e.targetCurrency, e.lastUpdated) IN (" +
            "  SELECT sub.targetCurrency, MAX(sub.lastUpdated) " +
            "  FROM ExchangeRate sub " +
            "  GROUP BY sub.targetCurrency" +
            ")")
    List<ExchangeRate> findLatestRates();

    // 특정 기간동안의 환율 데이터들을 반환
    @Query("SELECT e FROM ExchangeRate e " +
            "WHERE e.targetCurrency = :targetCurrency " +
            "AND e.lastUpdated BETWEEN :startDate AND :endDate " +
            "ORDER BY e.lastUpdated ASC")
    List<ExchangeRate> findRatesByPeriod(@Param("targetCurrency") String targetCurrency,
                                         @Param("startDate") LocalDate startDate,
                                         @Param("endDate") LocalDate endDate);

    boolean existsByLastUpdated(LocalDate lastUpdated);

    @Query(value = """
        WITH today AS (
            SELECT e.target_currency, e.exchange_rate AS today_rate, e.last_updated
            FROM exchange_rate e
            WHERE e.last_updated = (SELECT MAX(last_updated) FROM exchange_rate)
        ),
        yesterday AS (
            SELECT e.target_currency, e.exchange_rate AS yesterday_rate, e.last_updated
            FROM exchange_rate e
            WHERE e.last_updated = (SELECT MAX(last_updated) FROM exchange_rate WHERE last_updated < (SELECT MAX(last_updated) FROM exchange_rate))
        )
        SELECT 
            t.target_currency AS currency,
            c.currency_flag_code AS flagCode,
            t.today_rate AS todayRate,
            y.yesterday_rate AS yesterdayRate,
            CASE 
                WHEN y.yesterday_rate = 0 THEN 0 
                ELSE ((t.today_rate - y.yesterday_rate) / y.yesterday_rate) * 100 
            END AS changeRate
        FROM today t
        JOIN yesterday y ON t.target_currency = y.target_currency
        JOIN currency c ON t.target_currency = c.code
        ORDER BY changeRate DESC
        """,
            countQuery = "SELECT COUNT(DISTINCT target_currency) FROM exchange_rate",
            nativeQuery = true)
    Page<Object[]> findTopChangedRates(Pageable pageable);
}
