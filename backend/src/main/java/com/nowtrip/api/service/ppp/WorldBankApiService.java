package com.nowtrip.api.service.ppp;

import com.nowtrip.api.response.ppp.Country;
import com.nowtrip.api.response.ppp.DataPoint;
import com.nowtrip.api.response.ppp.Indicator;
import lombok.RequiredArgsConstructor;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class WorldBankApiService {
    private final WebClient.Builder webClientBuilder;

    public List<DataPoint> fetchPppData(String countryCode) {
        String baseUrl = "https://api.worldbank.org/v2";
        WebClient webClient = webClientBuilder.baseUrl(baseUrl).build();

        String url = String.format("/country/%s/indicator/NY.GDP.MKTP.PP.CD?format=json", countryCode);

        List<Object> response = webClient.get()
                .uri(url)
                .retrieve()
                .bodyToMono(new ParameterizedTypeReference<List<Object>>() {
                })
                .block();

        if (response == null || response.size() < 2) {
            throw new IllegalArgumentException("World Bank API 응답이 유효하지 않습니다.");
        }

//        @SuppressWarnings("unchecked")
        List<Map<String, Object>> dataList = (List<Map<String, Object>>) response.get(1);

        List<DataPoint> dataPoints = new ArrayList<>();
        for (Map<String, Object> data : dataList) {
            Map<String, Object> indicator = (Map<String, Object>) data.get("indicator");
            Map<String, Object> country = (Map<String, Object>) data.get("country");
            String date = (String) data.get("date");
            Number valueNumber = (Number) data.get("value");
            Double value = valueNumber != null ? valueNumber.doubleValue() : null;

            // DataPoint 객체 생성
            DataPoint dataPoint = new DataPoint(
                    new Indicator((String) indicator.get("id"), (String) indicator.get("value")),
                    new Country((String) country.get("id"), (String) country.get("value")),
                    (String) data.get("countryiso3code"),
                    date,
                    value
            );
            dataPoints.add(dataPoint);
        }

        return dataPoints;
    }
}
