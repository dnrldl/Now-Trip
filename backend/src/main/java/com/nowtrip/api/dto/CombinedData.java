package com.nowtrip.api.dto;

import lombok.*;

import java.math.BigDecimal;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CombinedData {
    private String countryName;
    private BigDecimal exchangeRate;
    private BigDecimal pppValue;
}
