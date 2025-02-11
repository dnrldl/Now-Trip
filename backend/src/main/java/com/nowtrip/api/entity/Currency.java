package com.nowtrip.api.entity;

import jakarta.persistence.*;
import lombok.*;

import java.util.ArrayList;
import java.util.List;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Table(name = "currency")
public class Currency {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 3)
    private String code; // JPY

    @Column(nullable = false)
    private String name; // Japanese Yen

    @Column(nullable = false)
    private String symbol; // ¥

    @Column(nullable = false)
    private String koreanName; // 일본 엔

    @Column(nullable = false, length = 2)
    private String currencyFlagCode; // jp

    @OneToMany(mappedBy = "currency")
    private List<Country> countries = new ArrayList<>();

}
