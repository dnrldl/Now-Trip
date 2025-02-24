package com.nowtrip.api.service.auth;

import com.nowtrip.api.request.UserLoginRequest;
import com.nowtrip.api.response.user.UserLoginResponse;
import com.nowtrip.api.security.PrincipalDetails;
import com.nowtrip.api.security.jwt.JwtProvider;
import io.jsonwebtoken.ExpiredJwtException;
import io.jsonwebtoken.JwtException;
import lombok.RequiredArgsConstructor;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.stereotype.Service;

import java.util.concurrent.TimeUnit;

@Service
@RequiredArgsConstructor
public class AuthService {
    private final JwtProvider jwtProvider;
    private final RedisTemplate<String, String> redisTemplate;
    private final UserDetailsService userDetailsService;
    private final AuthenticationManager authenticationManager;

    // 유저 로그인
    public UserLoginResponse login(UserLoginRequest request) {
        String email = request.getEmail();
        String password = request.getPassword();
        try {
            Authentication auth = authenticationManager.authenticate(new UsernamePasswordAuthenticationToken(email, password));
            Long userId = ((PrincipalDetails) auth.getPrincipal()).getUserId();

            String accessToken = jwtProvider.generateAccessToken(auth);
            String refreshToken = jwtProvider.generateRefreshToken(auth);
            Long expiration = jwtProvider.extractExpiration(refreshToken); // 절대 시간 반환 e.g. ~월 ~일
            long ttl = expiration - System.currentTimeMillis(); // 남은 시간 반환

            // redis에 refresh 토큰 저장 key = refreshToken:<userId> : <refreshToken> TTL = <expiration>
            redisTemplate.opsForValue().set("refreshToken:" + userId, refreshToken, ttl, TimeUnit.MILLISECONDS);

            return new UserLoginResponse(accessToken, refreshToken);
        } catch (Exception ex) {
            throw new IllegalArgumentException("이메일 또는 비밀번호를 확인하세요", ex);
        }
    }

    public void logout(String accessToken) {
        System.out.println("accessToken = " + accessToken);
        String userId = jwtProvider.extractUserId(accessToken).toString();
        Long expiration = jwtProvider.extractExpiration(accessToken);
        long ttl = expiration - System.currentTimeMillis();

        // 만료시간이 남아있다면 redis에 Access Token을 블랙리스트로 등록
        // blacklist:<accessToken> : <userId> TTl: <expiration>
        if (ttl > 0) {
            redisTemplate.opsForValue().set(
                    "blacklist:" + accessToken, userId, ttl, TimeUnit.MILLISECONDS
            );
        }

        // redis에서 Refresh Token 삭제
        String refreshTokenKey = "refreshToken:" + userId;
        if (Boolean.TRUE.equals(redisTemplate.hasKey(refreshTokenKey))) {
            redisTemplate.delete(refreshTokenKey);
        }
    }

    public String refreshAccessToken(String refreshToken, String oldAccessToken) {
        if (jwtProvider.isTokenExpired(refreshToken))
            throw new JwtException("refresh 토큰이 유효하지 않습니다.");

        String userId = jwtProvider.extractUserId(refreshToken).toString();
        String email = jwtProvider.extractUsername(refreshToken);

        // redis에 저장된 리프레시 토큰 추출
        String storedToken = redisTemplate.opsForValue().get("refreshToken:" + userId);
        if (storedToken == null)
            throw new BadCredentialsException("redis에 저장된 refresh 토큰이 없습니다.");
        if (!storedToken.equals(refreshToken))
            throw new BadCredentialsException("redis에 저장된 refresh 토큰이 일치하지 않습니다.");

        // 만료된 토큰의 만료시간 추출
        Long expiration = jwtProvider.extractExpiration(oldAccessToken);
        long ttl = expiration - System.currentTimeMillis();

        // redis에 기존 엑세스 토큰을 남은 유효시간동안 블랙리스트 등록
        if (ttl > 0)
            redisTemplate.opsForValue().set("blacklist:" + oldAccessToken, userId, ttl, TimeUnit.MILLISECONDS);

        // 새로운 액세스 토큰 발급
        UserDetails userDetails = userDetailsService.loadUserByUsername(email);
        Authentication auth = new UsernamePasswordAuthenticationToken(
                userDetails,
                null,
                userDetails.getAuthorities()
        );

        String newAccessToken = jwtProvider.generateAccessToken(auth);

        return newAccessToken;
    }
}

