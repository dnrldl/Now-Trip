package com.nowtrip.api.service.ppp;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.nowtrip.api.entity.Country;
import com.nowtrip.api.entity.PppData;
import com.nowtrip.api.repository.CountryRepository;
import com.nowtrip.api.repository.PppDataRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.util.UriComponentsBuilder;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class WorldBankApiService {
    private final WebClient.Builder webClientBuilder;
    private final CountryRepository countryRepository;
    private final PppDataRepository pppDataRepository;


    public List<PppData> fetchPppData(String year) {
        List<Country> countries = countryRepository.findAll();
        if (countries.isEmpty())
            throw new IllegalArgumentException("Country 데이터가 없습니다");

        // kor;jpn;chn ...
        String param = countries.stream()
                .map(Country::getIso3Code)
                .collect(Collectors.joining(";"));

        String url = UriComponentsBuilder.fromHttpUrl("https://api.worldbank.org/v2/country")
                .path("/{countries}/indicator/NY.GDP.MKTP.PP.CD")
                .queryParam("format", "json")
                .queryParam("date", year)
                .buildAndExpand(param)
                .toUriString();

        WebClient client = webClientBuilder.build();
        String response;
        try {
            response = client.get()
                    .uri(url)
                    .retrieve()
                    .bodyToMono(String.class)
                    .block();
        } catch (Exception e) {
            throw new RuntimeException("World Bank API 호출 실패: " + e.getMessage(), e);
        }

        // JSON 응답 데이터를 PppData 리스트로 변환
        ObjectMapper objectMapper = new ObjectMapper();
        List<PppData> pppDataList = new ArrayList<>();
        try {
            JsonNode jsonResponse = objectMapper.readTree(response);
            if (jsonResponse.isArray() && jsonResponse.size() > 1) {
                jsonResponse.get(1).forEach(node -> {
                    PppData pppData = new PppData();
                    pppData.setIso3Code(node.get("countryiso3code").asText());
                    pppData.setCountryName(node.get("country").get("value").asText());
                    pppData.setPppValue(node.has("value") && !node.get("value").isNull()
                            ? new BigDecimal(node.get("value").asText())
                            : null);
                    pppData.setYear(node.get("date").asText());
                    pppDataList.add(pppData);
                });
            }
        } catch (Exception e) {
            throw new RuntimeException("JSON 처리 실패: " + e.getMessage(), e);
        }

        log.info("PPP 데이터 처리 시작. 총 응답 데이터 수: {}", pppDataList.size());
        List<PppData> filteredDataList = pppDataList.stream()
                .filter(data -> data.getPppValue() != null)
                .collect(Collectors.toList());
        pppDataRepository.saveAll(filteredDataList);
        log.info("PPP 데이터 저장 완료. 저장된 데이터 수: {}", filteredDataList.size());

        return filteredDataList;
    }
}
