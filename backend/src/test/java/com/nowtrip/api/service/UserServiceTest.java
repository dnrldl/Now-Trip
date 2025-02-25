package com.nowtrip.api.service;

import com.nowtrip.api.entity.User;
import com.nowtrip.api.repository.UserRepository;
import com.nowtrip.api.request.UserRegistRequest;
import com.nowtrip.api.service.user.UserService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest
@Transactional
class UserServiceIntegrationTest {

    @Autowired
    private UserService userService;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Test
    void 유저_회원가입_실제DB_연동() {
        // given
        UserRegistRequest request = new UserRegistRequest(
                "test@gmail.com",
                "testtest!1",
                "test",
                "testtest",
                "01012345678"
        );

        // when
        userService.registerUser(request);

        // then
        User savedUser = userRepository.findByEmail("test@gmail.com").orElseThrow();
        assertThat(savedUser.getEmail()).isEqualTo(request.getEmail());
        assertThat(savedUser.getNickname()).isEqualTo(request.getNickname());
        assertThat(passwordEncoder.matches("testtest!1", savedUser.getPassword())).isTrue(); // 비밀번호 암호화 검증
    }
}