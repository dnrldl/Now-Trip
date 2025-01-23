package com.nowtrip.api.response.exchange;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.util.List;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class ExchangeRateDetailsResponse {
    private List<ExchangeResponse> rateList;
    private BigDecimal rateChange;
    private BigDecimal rateChangePercentage;
}
