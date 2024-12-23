package com.nowtrip.api.service.auth;

import com.nowtrip.api.enums.Role;
import com.nowtrip.api.request.UserLoginRequest;
import com.nowtrip.api.response.UserLoginResponse;
import com.nowtrip.api.security.CustomUserDetails;
import com.nowtrip.api.security.jwt.JwtProvider;
import lombok.RequiredArgsConstructor;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;

import java.util.concurrent.TimeUnit;

@Service
@RequiredArgsConstructor
public class AuthService {
    private final JwtProvider jwtProvider;
    private final RedisTemplate<String, String> redisTemplate;
    private final AuthenticationManager authenticationManager;

    public UserLoginResponse login(UserLoginRequest request) {
        String email = request.getEmail();
        String password = request.getPassword();
        try {
            Authentication auth = authenticationManager.authenticate(new UsernamePasswordAuthenticationToken(email, password));

            CustomUserDetails userDetails = (CustomUserDetails) auth.getPrincipal();
            Long userId = userDetails.getUserId();

            String accessToken = jwtProvider.generateAccessToken(email, userId, Role.USER);
            String refreshToken = jwtProvider.generateRefreshToken(email, userId);
            long expiration = jwtProvider.extractClaims(refreshToken).getExpiration().getTime();

            redisTemplate.opsForValue().set("refreshToken:" + userId, refreshToken, expiration, TimeUnit.MILLISECONDS);

            return new UserLoginResponse(accessToken, refreshToken);
        } catch (Exception ex) {
            throw new BadCredentialsException("로그인 실패: 이메일 또는 비밀번호를 확인하세요", ex);
        }
    }

    public void logout(String accessToken) {
        if (!jwtProvider.validateToken(accessToken))
            throw new IllegalArgumentException("유효하지 않은 access 토큰입니다");

        String userId = jwtProvider.extractUserId(accessToken).toString();
        long expiration = jwtProvider.extractClaims(accessToken).getExpiration().getTime() - System.currentTimeMillis();

        redisTemplate.opsForValue().set(
                "blacklist:" + accessToken, userId, expiration, TimeUnit.MILLISECONDS
        );

        redisTemplate.delete("refreshToken:" + userId);
    }

    // TODO Access 토큰 발급 받고 기존에 있는 토큰 블랙리스트에 추가
    public String refreshAccessToken(String refreshToken) {
        Long userId = jwtProvider.extractUserId(refreshToken);
        String email = jwtProvider.extractUsername(refreshToken);

        String storedToken = redisTemplate.opsForValue().get("refreshToken:" + userId);
        String accessToken = jwtProvider.refreshAccessToken(refreshToken, email, userId, Role.USER);
        if (storedToken == null) {
            throw new BadCredentialsException("redis에 저장된 refresh 토큰이 없습니다");
        }
        if (!storedToken.equals(refreshToken)) {
            throw new BadCredentialsException("redis에 저장된 refresh 토큰이 일치하지 않습니다");
        }

        return accessToken;
    }
}

