package com.nowtrip.api.repository;

import com.nowtrip.api.entity.Country;
import com.nowtrip.api.entity.Currency;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface CountryRepository extends JpaRepository<Country, Long> {
    Optional<Country> findByIso2Code(String iso3Code);

    List<Country> findByCurrency_Code(String currencyCode);

    @EntityGraph(attributePaths = {"currency"})
    List<Country> findAll();
}
