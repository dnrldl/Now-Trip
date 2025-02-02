package com.nowtrip.api.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "countries")
public class Country {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String countryName;

    @Column(nullable = false, unique = true, length = 3)
    private String iso3Code;

    @Column(nullable = false, unique = true, length = 2)
    private String iso2Code;

    @Column(nullable = false, length = 3)
    private String currencyCode;
}
