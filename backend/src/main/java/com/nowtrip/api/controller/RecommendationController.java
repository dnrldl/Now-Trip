package com.nowtrip.api.controller;

import com.nowtrip.api.response.recommendation.RecommendationResponse;
import com.nowtrip.api.service.recommendation.RecommendationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.math.BigDecimal;
import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/recommendations")
public class RecommendationController {
    private final RecommendationService recommendationService;

    @GetMapping
    public ResponseEntity<List<RecommendationResponse>> getRecommendations(
            @RequestParam BigDecimal budget) {
        List<RecommendationResponse> recommendations = recommendationService.recommendDestinations(budget);
        System.out.println("recommendations = " + recommendations);
        return ResponseEntity.ok(recommendations);
    }
}
