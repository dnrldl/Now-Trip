package com.nowtrip.api.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "country")
public class Country {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false, unique = true, length = 3)
    private String iso3Code;

    @Column(nullable = false, unique = true, length = 2)
    private String iso2Code;

    @Column(nullable = false)
    private String korean_name;

    @ManyToOne
    @JoinColumn(name = "currency_id", nullable = false)
    private Currency currency;
}
