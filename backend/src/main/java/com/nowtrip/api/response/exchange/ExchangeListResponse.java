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
    private String iso2Code;
    private BigDecimal rate;
    private BigDecimal rateChangePercentage;
}
