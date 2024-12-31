package com.nowtrip.api.repository;

import com.nowtrip.api.entity.PppData;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface PppDataRepository extends JpaRepository<PppData, Long> {
    List<PppData> findByIso3Code(String iso3Code);
}
