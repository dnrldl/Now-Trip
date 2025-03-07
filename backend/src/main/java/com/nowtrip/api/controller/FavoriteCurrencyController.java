package com.nowtrip.api.controller;

import com.nowtrip.api.response.currency.CurrencyResponse;
import com.nowtrip.api.service.favorite.FavoriteCurrencyService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/favorites")
public class FavoriteCurrencyController {
    private final FavoriteCurrencyService favoriteCurrencyService;

    // 즐겨찾기 추가
    @PostMapping("/{currencyId}")
    public ResponseEntity<String> addFavoriteCurrency(@PathVariable Long currencyId) {
        favoriteCurrencyService.addFavoriteCurrency(currencyId);
        return ResponseEntity.ok("즐겨찾기가 추가되었습니다.");
    }

    // 즐겨찾기 삭제
    @DeleteMapping("/{currencyId}")
    public ResponseEntity<String> removeFavoriteCurrency(@PathVariable Long currencyId) {
        favoriteCurrencyService.removeFavoriteCurrency(currencyId);
        return ResponseEntity.ok("즐겨찾기가 삭제되었습니다.");
    }

    // 사용자의 즐겨찾기한 통화 목록 조회
    @GetMapping
    public ResponseEntity<List<CurrencyResponse>> getFavoriteCurrencies() {
        List<CurrencyResponse> favoriteCurrencies = favoriteCurrencyService.getFavoriteCurrencies();
        return ResponseEntity.ok(favoriteCurrencies);
    }
}
