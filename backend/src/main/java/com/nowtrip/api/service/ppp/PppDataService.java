package com.nowtrip.api.service.ppp;

import com.nowtrip.api.entity.PppData;
import com.nowtrip.api.repository.PppDataRepository;
import com.nowtrip.api.response.ppp.DataPoint;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;

@Service
@RequiredArgsConstructor
public class PppDataService {

    private final WorldBankApiService apiService;
    private final PppDataRepository pppDataRepository;

    @Transactional
    public void savePppData(String countryCode) {
        List<DataPoint> response = apiService.fetchPppData(countryCode);

        for (DataPoint dataPoint : response) {
            String year = dataPoint.getDate();
            Double value = dataPoint.getValue();
            String countryCodeFromData = dataPoint.getCountryiso3code(); // 국가 코드
            String countryName = dataPoint.getCountry().getValue(); // 국가 이름

            // 데이터가 존재하지 않는 경우 저장
            if (value != null && !pppDataRepository.existsByCountryCodeAndYear(countryCodeFromData, year)) {
                PppData pppData = PppData.builder()
                        .countryCode(countryCodeFromData)
                        .countryName(countryName)
                        .pppValue(BigDecimal.valueOf(value))
                        .year(year)
                        .build();
                pppDataRepository.save(pppData);
            }
        }
    }
}
