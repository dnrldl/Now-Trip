package com.nowtrip.api.controller;

import com.nowtrip.api.response.favorite.FavoriteResponse;
import com.nowtrip.api.service.favorite.FavoriteService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/favorites")
@RequiredArgsConstructor
public class FavoriteController {
    private final FavoriteService favoriteService;

    // 즐겨찾기 추가
    @PostMapping
    public ResponseEntity<FavoriteResponse> addFavorite(@RequestParam Long countryId) {
        FavoriteResponse favorite = favoriteService.addFavorite(countryId);
        return ResponseEntity.ok(favorite);
    }

    // 즐겨찾기 삭제
    @DeleteMapping("/{countryId}")
    public ResponseEntity<String> removeFavorite(@PathVariable Long countryId) {
        favoriteService.removeFavorite(countryId);
        return ResponseEntity.ok("즐겨찾기에서 삭제되었습니다.");
    }

    // 유저의 즐겨찾기 목록 조회
    @GetMapping
    public ResponseEntity<List<FavoriteResponse>> getFavorites() {
        List<FavoriteResponse> favorites = favoriteService.getFavorites();
        return ResponseEntity.ok(favorites);
    }
}
