package com.nowtrip.api.service.auth;

import com.nowtrip.api.enums.Role;
import com.nowtrip.api.request.UserLoginRequest;
import com.nowtrip.api.response.user.UserLoginResponse;
import com.nowtrip.api.security.CustomUserDetails;
import com.nowtrip.api.security.jwt.JwtProvider;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.ExpiredJwtException;
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

    // 유저 로그인
    public UserLoginResponse login(UserLoginRequest request) {
        String email = request.getEmail();
        String password = request.getPassword();
        try {
            Authentication auth = authenticationManager.authenticate(new UsernamePasswordAuthenticationToken(email, password));

            CustomUserDetails userDetails = (CustomUserDetails) auth.getPrincipal();
            Long userId = userDetails.getUserId();

            String accessToken = jwtProvider.generateAccessToken(email, userId, Role.USER);
            String refreshToken = jwtProvider.generateRefreshToken(email, userId);
            Long expiration = jwtProvider.extractExpiration(refreshToken);

            // redis에 refresh 토큰 저장 key = refreshToken:<userId> : <refreshToken> TTL = <expiration>
            redisTemplate.opsForValue().set("refreshToken:" + userId, refreshToken, expiration, TimeUnit.MILLISECONDS);

            return new UserLoginResponse(accessToken, refreshToken);
        } catch (Exception ex) {
            throw new IllegalArgumentException("이메일 또는 비밀번호를 확인하세요", ex);
        }
    }

    public void logout(String accessToken) {
        try {
            String userId = jwtProvider.extractUserId(accessToken).toString();
            Long expiration = jwtProvider.extractExpiration(accessToken);

            // 만료시간이 남아있다면 redis에 Access Token을 블랙리스트로 등록
            // blacklist:<accessToken> : <userId> TTl: <expiration>
            if (expiration > 0) {
                redisTemplate.opsForValue().set(
                        "blacklist:" + accessToken, userId, expiration, TimeUnit.MILLISECONDS
                );
            }

            // redis에서 Refresh Token 삭제
            String refreshTokenKey = "refreshToken:" + userId;
            if (Boolean.TRUE.equals(redisTemplate.hasKey(refreshTokenKey))) {
                redisTemplate.delete(refreshTokenKey);
            }

        } catch (ExpiredJwtException ex) {
            // 토큰이 만료된 경우 로그아웃
            System.out.println("만료된 토큰으로 로그아웃 요청: " + accessToken);
        } catch (Exception ex) {
            throw new RuntimeException("로그아웃 처리 중 오류가 발생했습니다.", ex);
        }
    }

    // TODO Access 토큰 발급 받고 기존에 있는 토큰 블랙리스트에 추가
    public String refreshAccessToken(String refreshToken) {
        // 리프레시 토큰에서 id, email 추출
        Long userId = jwtProvider.extractUserId(refreshToken);
        String email = jwtProvider.extractUsername(refreshToken);

        // redis에 저장된 리프레시 토큰 호출
        String storedToken = redisTemplate.opsForValue().get("refreshToken:" + userId);
        // 리프레시 토큰으로 엑세스 토큰 재발급
        String newAccessToken = jwtProvider.refreshAccessToken(refreshToken, email, userId, Role.USER);

        if (storedToken == null)
            throw new BadCredentialsException("redis에 저장된 refresh 토큰이 없습니다");

        if (!storedToken.equals(refreshToken))
            throw new BadCredentialsException("redis에 저장된 refresh 토큰이 일치하지 않습니다");


        return newAccessToken;
    }
}

