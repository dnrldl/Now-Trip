package com.nowtrip.api.repository;

import com.nowtrip.api.entity.PppData;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface PppDataRepository extends JpaRepository<PppData, Long> {
    boolean existsByCountryCodeAndYear(String id, String year);

    Optional<PppData> findByCountryCode(String countryCode);
}
