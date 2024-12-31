package com.nowtrip.api.response.ppp;

import lombok.*;

import java.math.BigDecimal;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class PppResponse {
    private String countryName;
    private String iso3Code;
    private BigDecimal pppValue;
    private String year;
}
