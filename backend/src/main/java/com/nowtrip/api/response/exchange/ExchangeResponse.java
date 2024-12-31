package com.nowtrip.api.response.exchange;

import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class ExchangeResponse {
    private String targetCurrency;
    private BigDecimal exchangeRate;
    private LocalDateTime lastUpdated;
}
