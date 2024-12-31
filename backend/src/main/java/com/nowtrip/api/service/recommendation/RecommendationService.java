package com.nowtrip.api.service.recommendation;

import com.nowtrip.api.repository.ExchangeRateRepository;
import com.nowtrip.api.repository.PppDataRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class RecommendationService {
    private final ExchangeRateRepository exchangeRateRepository;
    private final PppDataRepository pppDataRepository;


}
