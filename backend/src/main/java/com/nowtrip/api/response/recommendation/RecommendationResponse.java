package com.nowtrip.api.response.recommendation;

import lombok.AllArgsConstructor;
import lombok.Getter;

import java.math.BigDecimal;

@AllArgsConstructor
@Getter
public class RecommendationResponse {
    private String countryName;
    private String countryCode;
    private String currencyCode;
    private BigDecimal localBudget;
    private BigDecimal exchangeRate;
}
