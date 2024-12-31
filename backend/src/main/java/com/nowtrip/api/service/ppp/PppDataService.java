package com.nowtrip.api.service.ppp;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.nowtrip.api.entity.PppData;
import com.nowtrip.api.repository.PppDataRepository;
import com.nowtrip.api.response.ppp.PppResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.Arrays;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PppDataService {
    private final PppDataRepository pppDataRepository;
    private final WorldBankApiService worldBankApiService;

    public void saveAllPppData() {
        worldBankApiService.fetchPppData("2023");
    }

    public List<PppResponse> getAllPppData() {
        return pppDataRepository.findAll().stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }

    public List<PppResponse> getPppDataByCountry(String iso3Code) {
        return pppDataRepository.findByIso3Code(iso3Code).stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }

    private PppResponse convertToResponse(PppData pppData) {
        return PppResponse.builder()
                .countryName(pppData.getCountryName())
                .iso3Code(pppData.getIso3Code())
                .pppValue(pppData.getPppValue())
                .year(pppData.getYear())
                .build();
    }
}
