package com.nowtrip.api.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;

@Entity
@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
@Builder
@Table(name = "ppp_data")
public class PppData {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 3)
    private String iso3Code; // iso3

    @Column(nullable = false)
    private String countryName;

    @Column(precision = 18, scale = 2)
    private BigDecimal pppValue;

    @Column(nullable = false)
    private String year;
}
