package com.nowtrip.api.response.country;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CountryResponse {
    private String iso3Code;
    private String koreanName;
}
