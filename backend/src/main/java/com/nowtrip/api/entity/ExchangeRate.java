package com.nowtrip.api.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
@Builder
@Table(name = "exchange_rate")
public class ExchangeRate {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @Column(nullable = false, length = 3, unique = true)
    private String targetCurrency;
    @Column(nullable = false, precision = 18, scale = 6)
    private BigDecimal exchangeRate;
    @Column(nullable = false)
    private LocalDateTime lastUpdatedAt;
}
