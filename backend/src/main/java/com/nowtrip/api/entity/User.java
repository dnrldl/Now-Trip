package com.nowtrip.api.entity;

import com.nowtrip.api.enums.Role;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "users")
public class User extends Auditable{
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String email;

    @Column(nullable = false)
    private String password;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false, unique = true)
    private String nickname;

    @Column
    private String phoneNumber;

    @Column
    private String profile;

    @Column(nullable = false)
    private boolean isSocial = false;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Role role;

    public User(Long userId) {
        this.id = userId;
    }
}

