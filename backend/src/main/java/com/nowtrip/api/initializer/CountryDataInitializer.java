package com.nowtrip.api.initializer;

import com.nowtrip.api.repository.CountryRepository;
import com.nowtrip.api.service.country.CountryService;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class CountryDataInitializer implements CommandLineRunner {
    private final CountryRepository countryRepository;
    private final CountryService countryService;
    @Override
    public void run(String... args) throws Exception {
        if (countryRepository.count() == 0)
            countryService.saveCountriesFromCsv("src/main/resources/country.csv");
    }
}
