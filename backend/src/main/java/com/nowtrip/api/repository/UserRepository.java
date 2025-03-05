package com.nowtrip.api.repository;


import com.nowtrip.api.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);
    boolean existsByEmail(String email);
    boolean existsByNickname(String nickname);
    boolean existsByPhoneNumber(String phoneNumber);

    @Query("SELECT u.nickname FROM User u WHERE u.id = :userId")
    Optional<String> findNicknameByUserId(@Param("userId") Long userId);
}
