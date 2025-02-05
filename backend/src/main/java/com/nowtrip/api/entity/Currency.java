package com.nowtrip.api.entity;

import jakarta.persistence.*;
import lombok.*;

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
    private String currencyCode;

    @Column(nullable = false)
    private String currencyName;

    @Column(nullable = false)
    private String symbol;

    @Column(nullable = false)
    private String koreanName;

}
