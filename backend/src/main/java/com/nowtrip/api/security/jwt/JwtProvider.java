package com.nowtrip.api.security.jwt;

import com.nowtrip.api.enums.Role;
import com.nowtrip.api.security.CustomUserDetails;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.ExpiredJwtException;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.stereotype.Component;

import java.security.Key;
import java.util.Date;

@Component
public class JwtProvider {
    @Value("${jwt.secret.key}")
    private String SECRET_KEY;
    private final long ACCESS_TOKEN_VALIDITY = 1000 * 60 * 60 * 24; // 24시간
    private final long REFRESH_TOKEN_VALIDITY = 1000 * 60 * 60 * 24 * 7; // 일주일

    public String generateAccessToken(Authentication auth) {
        CustomUserDetails principal = (CustomUserDetails) auth.getPrincipal();
        String username = principal.getUsername();
        Long userId = principal.getUserId();

        return generateToken(username, userId, Role.USER, ACCESS_TOKEN_VALIDITY);
    }

    public String generateRefreshToken(Authentication auth) {
        CustomUserDetails principal = (CustomUserDetails) auth.getPrincipal();
        String username = principal.getUsername();
        Long userId = principal.getUserId();

        return generateToken(username, userId, null, REFRESH_TOKEN_VALIDITY);
    }

    private String generateToken(String username, Long userId, Role role, long validity) {
        Claims claims = Jwts.claims();
        claims.put("sub", username);
        claims.put("userId", userId);
        if (role != null) {
            claims.put("role", role);
        }

        return Jwts.builder()
                .setClaims(claims)
                .setSubject(username)
                .setIssuedAt(new Date(System.currentTimeMillis()))
                .setExpiration(new Date(System.currentTimeMillis() + validity))
                .signWith(getSignKey())
                .compact();
    }

    // 토큰에서 사용자명(이메일) 추출
    public String extractUsername(String token) {
        return extractClaims(token).getSubject();
    }

    public Long extractUserId(String token) {
        Claims claims = extractClaims(token);
        return Long.valueOf(claims.get("userId").toString());
    }

    public Long extractExpiration(String token) {
        Claims claims = extractClaims(token);
        return claims.getExpiration().getTime();
    }

    // 토큰에서 사용자 정보 추출
    public Claims extractClaims(String token) {
        try {
            return Jwts.parserBuilder()
                    .setSigningKey(getSignKey())
                    .build()
                    .parseClaimsJws(token)
                    .getBody();
        } catch (ExpiredJwtException ex) {
            return ex.getClaims();
        }
    }

    public boolean validateToken(String token) {
        try {
            return !isTokenExpired(token);
        } catch (JwtException | IllegalArgumentException e) {
            return false;
        }
    }

    public boolean isTokenExpired(String token) {
        return extractClaims(token).getExpiration().before(new Date());
    }

    /**
     * HMAC (Hash-based Message Authentication Code) SHA
     * Base64로 디코딩
     * HMAC SHA 알고리즘을 사용
     */
    private Key getSignKey() {
        byte[] keyBytes = Decoders.BASE64.decode(SECRET_KEY);
        return Keys.hmacShaKeyFor(keyBytes);
    }
}
