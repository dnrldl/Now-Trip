package com.nowtrip.api.controller;

import com.nowtrip.api.response.country.CountriesResponse;
import com.nowtrip.api.service.country.CountryService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/country")
public class CountryController {
    private final CountryService countryService;
    @GetMapping
    public ResponseEntity<List<CountriesResponse>> getCountries() {
        List<CountriesResponse> responses = countryService.getAllCountries();
        return ResponseEntity.ok(responses);
    }
}
