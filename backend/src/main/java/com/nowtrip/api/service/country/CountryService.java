package com.nowtrip.api.service.country;

import com.nowtrip.api.entity.Country;
import com.nowtrip.api.repository.CountryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.BufferedReader;
import java.io.FileReader;
import java.io.IOException;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class CountryService {
    private final CountryRepository countryRepository;

    @Transactional
    public void saveCountriesFromCsv(String filePath) throws IOException {
        List<Country> countries = new ArrayList<>();
        try (BufferedReader br = new BufferedReader(new FileReader(filePath))){
            String line;
            boolean isFirstLine = true;

            while ((line = br.readLine()) != null) {
                if (isFirstLine) {
                    isFirstLine = false;
                    continue;
                }

                String[] data = line.split(",");
                String countryName = data[0].trim();
                String iso3Code = data[1].trim();
                String currencyCode = data[2].trim();

                countries.add(Country.builder()
                                .iso3Code(iso3Code)
                                .countryName(countryName)
                                .currencyCode(currencyCode)
                                .build());
            }
        }
        countryRepository.saveAll(countries);
    }
}
