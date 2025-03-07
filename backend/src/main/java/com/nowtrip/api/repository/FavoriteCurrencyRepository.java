package com.nowtrip.api.repository;

import com.nowtrip.api.entity.Currency;
import com.nowtrip.api.entity.FavoriteCurrency;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface FavoriteCurrencyRepository extends JpaRepository<FavoriteCurrency, Long> {
    // 특정 사용자가 즐겨찾기한 통화 목록 조회
    @Query("SELECT f.currency FROM FavoriteCurrency f WHERE f.user.id = :userId")
    List<Currency> findFavoriteCurrenciesByUserId(@Param("userId") Long userId);

    // 특정 사용자 & 통화의 즐겨찾기 여부 확인
    boolean existsByUserIdAndCurrencyId(Long userId, Long currencyId);

    // 특정 즐겨찾기 삭제
    void deleteByUserIdAndCurrencyId(Long userId, Long currencyId);
}
