package com.nowtrip.api.response.currency;

import lombok.*;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class CurrencyResponse {
    private String code;
    private String koreanName;
    private String flagCode;
}
