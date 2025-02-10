package com.nowtrip.api.response.country;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CountriesResponse {
    private Long id;
    private String name;
    private String iso3Code;
    private String iso2Code;
    private String koreanName;
    private CurrencyDto currency;

    @Getter
    @AllArgsConstructor
    public static class CurrencyDto {
        private String code;
        private String symbol;
        private String currencyFlagCode;
    }
}
