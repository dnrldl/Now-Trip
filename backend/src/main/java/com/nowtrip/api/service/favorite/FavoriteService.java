package com.nowtrip.api.service.favorite;

import com.nowtrip.api.entity.Country;
import com.nowtrip.api.entity.Favorite;
import com.nowtrip.api.entity.User;
import com.nowtrip.api.repository.CountryRepository;
import com.nowtrip.api.repository.FavoriteRepository;
import com.nowtrip.api.repository.UserRepository;
import com.nowtrip.api.response.favorite.FavoriteResponse;
import com.nowtrip.api.security.CustomUserDetails;
import com.nowtrip.api.service.auth.AuthenticationHelper;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class FavoriteService {
    private final FavoriteRepository favoriteRepository;
    private final UserRepository userRepository;
    private final CountryRepository countryRepository;
    private final AuthenticationHelper authenticationHelper;

    public FavoriteResponse addFavorite(Long countryId) {
        Long userId = authenticationHelper.getCurrentUser().getUserId();

        if (favoriteRepository.existsByUserIdAndCountryId(userId, countryId)) {
            throw new IllegalStateException("이미 즐겨찾기에 추가된 국가입니다.");
        }

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("유효하지 않은 유저 ID입니다."));
        Country country = countryRepository.findById(countryId)
                .orElseThrow(() -> new IllegalArgumentException("유효하지 않은 국가 ID입니다."));

        Favorite favorite = new Favorite();
        favorite.setUser(user);
        favorite.setCountry(country);
        favoriteRepository.save(favorite);

        return new FavoriteResponse(favorite.getId(), userId, countryId, favorite.getCreatedAt());
    }

    public void removeFavorite(Long countryId) {
        CustomUserDetails principal = (CustomUserDetails) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        Long userId = principal.getUserId();

        Favorite favorite = favoriteRepository.findByUserIdAndCountryId(userId, countryId)
                .orElseThrow(() -> new IllegalArgumentException("즐겨찾기 데이터가 없습니다."));
        favoriteRepository.delete(favorite);
    }

    public List<FavoriteResponse> getFavorites() {
        Long userId = authenticationHelper.getCurrentUser().getUserId();
        List<Favorite> favorites = favoriteRepository.findByUserId(userId);

        return favorites.stream().map(favorite ->
                new FavoriteResponse(favorite.getId(),
                        userId,
                        favorite.getCountry().getId(),
                        favorite.getCreatedAt())).toList();
    }
}
