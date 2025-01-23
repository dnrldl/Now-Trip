package com.nowtrip.api.controller;

import com.nowtrip.api.entity.Favorite;
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
    public ResponseEntity<Favorite> addFavorite(@RequestParam Long userId, @RequestParam Long countryId) {
        Favorite favorite = favoriteService.addFavorite(userId, countryId);
        return ResponseEntity.ok(favorite);
    }

    // 즐겨찾기 삭제
    @DeleteMapping
    public ResponseEntity<String> removeFavorite(@RequestParam Long userId, @RequestParam Long countryId) {
        favoriteService.removeFavorite(userId, countryId);
        return ResponseEntity.ok("즐겨찾기에서 삭제되었습니다.");
    }

    // 유저의 즐겨찾기 목록 조회
    @GetMapping
    public ResponseEntity<List<Favorite>> getFavorites(@RequestParam Long userId) {
        List<Favorite> favorites = favoriteService.getFavorites(userId);
        return ResponseEntity.ok(favorites);
    }
}
