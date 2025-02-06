package com.nowtrip.api.controller;

import com.nowtrip.api.entity.Country;
import com.nowtrip.api.repository.CountryRepository;
import com.nowtrip.api.response.country.CountryResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/country")
public class CountryController {
    private final CountryRepository countryRepository;

    @GetMapping
    public ResponseEntity<List<CountryResponse>> getCountries() {
        List<Country> countries = countryRepository.findAll();
        List<CountryResponse> responses = countries.stream().map(country -> CountryResponse.builder()
                        .iso3Code(country.getIso3Code())
                        .koreanName(country.getKorean_name())
                        .build())
                .collect(Collectors.toList());
        return ResponseEntity.ok(responses);
    }
}
