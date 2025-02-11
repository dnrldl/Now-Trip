package com.nowtrip.api.service.country;

import com.nowtrip.api.entity.Country;
import com.nowtrip.api.repository.CountryRepository;
import com.nowtrip.api.response.country.CountriesResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CountryService {
    private final CountryRepository countryRepository;

    public List<CountriesResponse> getAllCountries() {
        List<Country> countries = countryRepository.findAll(Sort.by(Sort.Direction.ASC, "koreanName"));

        return countries.stream().map(this::convertToDto).collect(Collectors.toList());
    }

    private CountriesResponse convertToDto(Country country) {
        return CountriesResponse.builder()
                .id(country.getId())
                .name(country.getName())
                .iso3Code(country.getIso3Code())
                .iso2Code(country.getIso2Code())
                .koreanName(country.getKoreanName())
                .currency(new CountriesResponse.CurrencyDto(
                        country.getCurrency().getCode(),
                        country.getCurrency().getSymbol(),
                        country.getCurrency().getCurrencyFlagCode()
                ))
                .build();
    }
}
