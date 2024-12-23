package com.nowtrip.api.response.ppp;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class DataPoint {
    private Indicator indicator; // 지표 정보
    private Country country;     // 국가 정보
    private String countryiso3code; // 국가 코드 (3자리)
    private String date;            // 데이터 연도
    private Double value;           // GDP 값
}
