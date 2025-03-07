package com.nowtrip.api.initializer;

import com.nowtrip.api.repository.UserRepository;
import com.nowtrip.api.request.UserRegistRequest;
import com.nowtrip.api.service.user.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

@RequiredArgsConstructor
@Component
public class TestUserRunner implements CommandLineRunner {
    private final UserService userService;
    private final UserRepository userRepository;

    @Override
    public void run(String... args) throws Exception {
        if (userRepository.existsByEmail("test@test.com")) {
            return ;
        }

        UserRegistRequest userRegistRequest = new UserRegistRequest(
                "test@test.com",
                "testtest!1",
                "test",
                "test",
                "01000000000"
        );

        userService.registerUser(userRegistRequest);
    }
}
