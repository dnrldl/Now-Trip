package com.nowtrip.api.security.jwt;

import com.nowtrip.api.enums.Role;
import com.nowtrip.api.security.PrincipalDetails;
import io.jsonwebtoken.*;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Component;

import java.security.Key;
import java.util.Date;

@Component
public class JwtProvider {
    @Value("${jwt.secret.key}")
    private String SECRET_KEY;
    private final long ACCESS_TOKEN_VALIDITY = 1000; // 24시간
    private final long REFRESH_TOKEN_VALIDITY = 1000 * 60 * 60 * 24 * 7; // 일주일

    public String generateAccessToken(Authentication auth) {
        PrincipalDetails principal = (PrincipalDetails) auth.getPrincipal();
        String username = principal.getUsername(); // 이메일
        Long userId = principal.getUserId();
        return generateToken(username, userId, Role.USER, ACCESS_TOKEN_VALIDITY);
    }

    public String generateRefreshToken(Authentication auth) {
        PrincipalDetails principal = (PrincipalDetails) auth.getPrincipal();
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
            Jwts.parser().setSigningKey(SECRET_KEY).parseClaimsJws(token);
            return true;
        } catch (ExpiredJwtException e) {
            throw new JwtException("만료된 JWT 토큰입니다.");
        } catch (UnsupportedJwtException e) {
            throw new JwtException("지원되지 않는 JWT 토큰입니다.");
        } catch (MalformedJwtException e) {
            throw new JwtException("손상된 JWT 토큰입니다.");
        } catch (IllegalArgumentException e) {
            throw new JwtException("JWT 토큰이 비어 있습니다.");
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
