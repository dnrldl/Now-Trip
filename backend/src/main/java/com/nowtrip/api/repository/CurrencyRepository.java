package com.nowtrip.api.repository;

import com.nowtrip.api.entity.Currency;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface CurrencyRepository extends JpaRepository<Currency, Long> {
    @EntityGraph(attributePaths = "countries")
    @Query("SELECT c FROM Currency c")
    List<Currency> findAllWithCountries();
}
