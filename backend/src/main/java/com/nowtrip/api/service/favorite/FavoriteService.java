package com.nowtrip.api.service.favorite;

import com.nowtrip.api.entity.Country;
import com.nowtrip.api.entity.Favorite;
import com.nowtrip.api.entity.User;
import com.nowtrip.api.repository.CountryRepository;
import com.nowtrip.api.repository.FavoriteRepository;
import com.nowtrip.api.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class FavoriteService {
    private final FavoriteRepository favoriteRepository;
    private final UserRepository userRepository;
    private final CountryRepository countryRepository;

    public Favorite addFavorite(Long userId, Long countryId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("유효하지 않은 유저 ID입니다."));
        Country country = countryRepository.findById(countryId)
                .orElseThrow(() -> new IllegalArgumentException("유효하지 않은 국가 ID입니다."));

        // 이미 즐겨찾기 여부 확인
        favoriteRepository.findByUserIdAndCountryId(userId, countryId)
                .ifPresent(f -> {
                    throw new IllegalStateException("이미 즐겨찾기에 추가된 국가입니다.");
                });

        Favorite favorite = new Favorite();
        favorite.setUser(user);
        favorite.setCountry(country);
        return favoriteRepository.save(favorite);
    }

    public void removeFavorite(Long userId, Long countryId) {
        Favorite favorite = favoriteRepository.findByUserIdAndCountryId(userId, countryId)
                .orElseThrow(() -> new IllegalArgumentException("즐겨찾기 데이터가 없습니다."));
        favoriteRepository.delete(favorite);
    }

    public List<Favorite> getFavorites(Long userId) {
        return favoriteRepository.findByUserId(userId);
    }
}
