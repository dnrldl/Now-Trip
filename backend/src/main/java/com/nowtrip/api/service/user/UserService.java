package com.nowtrip.api.service.user;


import com.nowtrip.api.entity.User;
import com.nowtrip.api.exception.UserNotFoundException;
import com.nowtrip.api.request.UserProfileRequest;
import com.nowtrip.api.request.UserPwUpdateRequest;
import com.nowtrip.api.request.UserRegistRequest;
import com.nowtrip.api.request.UserNickNameUpdateRequest;
import com.nowtrip.api.response.user.UserInfoResponse;
import com.nowtrip.api.enums.Role;
import com.nowtrip.api.exception.DuplicateException;
import com.nowtrip.api.repository.UserRepository;
import com.nowtrip.api.security.PrincipalDetails;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class UserService {
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public void registerUser(UserRegistRequest request) {
        validateRegisterRequest(request);

        User user = User.builder()
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .name(request.getName())
                .nickname(request.getNickname())
                .phoneNumber(request.getPhoneNumber())
                .role(Role.USER)
                .build();
        userRepository.save(user);
    }

    private void validateRegisterRequest(UserRegistRequest request) {
        if (userRepository.existsByEmail(request.getEmail()))
            throw new DuplicateException("이미 사용 중인 이메일입니다.");
        if (userRepository.existsByNickname(request.getNickname()))
            throw new DuplicateException("닉네임이 이미 사용 중입니다.");
        if (userRepository.existsByPhoneNumber(request.getPhoneNumber()))
            throw new DuplicateException("전화번호가 이미 사용 중입니다.");
    }

    public UserInfoResponse getUserInfo() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByEmail(email).orElseThrow(() -> new UserNotFoundException("유저를 찾을 수 없습니다"));

        return UserInfoResponse.builder()
                .email(user.getEmail())
                .name(user.getName())
                .nickname(user.getNickname())
                .phoneNumber(user.getPhoneNumber())
                .profile(user.getProfile())
                .createdAt(user.getCreatedAt())
                .updatedAt(user.getUpdatedAt())
                .role(user.getRole())
                .build();
    }

    public void updateUserPassword(UserPwUpdateRequest request) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByEmail(email).orElseThrow(() -> new UserNotFoundException("유저를 찾을 수 없습니다"));

        user.setPassword(passwordEncoder.encode(request.getPassword()));
        userRepository.save(user);
    }

    public void updateProfile(UserProfileRequest request) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByEmail(email).orElseThrow(() -> new UserNotFoundException("유저를 찾을 수 없습니다"));

        if (request.getNickname() != null)
            user.setNickname(request.getNickname());
        if (request.getProfile() != null)
            user.setProfile(request.getProfile());

        userRepository.save(user);
    }

    public void deleteUser() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByEmail(email).orElseThrow(() -> new UserNotFoundException("유저를 찾을 수 없습니다"));

        userRepository.delete(user);
    }
}

