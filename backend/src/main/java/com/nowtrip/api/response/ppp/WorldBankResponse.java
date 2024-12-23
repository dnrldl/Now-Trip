package com.nowtrip.api.response.ppp;

import lombok.Data;

import java.util.List;

@Data
public class WorldBankResponse {
    private Meta meta; // 첫 번째 배열 요소
    private List<DataPoint> data; // 두 번째 배열 요소
}
