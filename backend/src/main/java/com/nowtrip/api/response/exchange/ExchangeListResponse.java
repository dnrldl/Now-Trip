package com.nowtrip.api.response.exchange;

import lombok.*;

import java.math.BigDecimal;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class ExchangeListResponse {
    private String targetCurrency;
    private String flagCode;
    private String koreanName;
    private String symbol;
    private BigDecimal rate;
    private BigDecimal rateChangePercentage;
}
