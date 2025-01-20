package com.nowtrip.api.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
@Builder
@Table(name = "exchange_rate", // 인덱스 사용하여 풀스캔 방지
        indexes = @Index(name = "idx_last_updated", columnList = "lastUpdated"))
public class ExchangeRate {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 3)
    private String targetCurrency;

    @Column(nullable = false, precision = 18, scale = 6)
    private BigDecimal exchangeRate;

    @Column(nullable = false)
    private LocalDate lastUpdated;
}
