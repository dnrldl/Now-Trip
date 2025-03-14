package com.nowtrip.api.security.jwt;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.nowtrip.api.security.CustomUserDetailsService;
import com.nowtrip.api.security.PrincipalDetails;
import io.jsonwebtoken.ExpiredJwtException;
import io.jsonwebtoken.JwtException;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.HashMap;
import java.util.Map;

/**
 * JWT 인증 필터
 * - HTTP 요청에서 Authorization 헤더를 읽어 JWT 토큰 검증 후 인증 처리
 * - 만료된 토큰, 블랙리스트 토큰 예외 처리
 */
@Component
@RequiredArgsConstructor
public class JwtAuthenticationFilter extends OncePerRequestFilter {
    private final JwtProvider jwtProvider;
    private final RedisTemplate<String, String> redisTemplate;
    private final CustomUserDetailsService userDetailsService;

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain) throws ServletException, IOException {
        String token = extractTokenFromHeader(request);
        if (token != null) {
            try {
                if (jwtProvider.isTokenExpired(token))
                    throw new ExpiredJwtException(null, null, "토큰이 만료되었습니다");

                if (isTokenBlacklisted(token))
                    throw new JwtException("블랙리스트에 있는 토큰입니다");

                String email = jwtProvider.extractUsername(token);
                PrincipalDetails userDetails = (PrincipalDetails) userDetailsService.loadUserByUsername(email);

                Authentication authentication = new UsernamePasswordAuthenticationToken(
                        userDetails,
                        null,
                        userDetails.getAuthorities()
                );

                SecurityContextHolder.getContext().setAuthentication(authentication);
            } catch (JwtException ex) {
                response.setContentType("application/json;charset=UTF-8");
                response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);

                Map<String, Object> responseData = new HashMap<>();
                responseData.put("timestamp", System.currentTimeMillis());
                responseData.put("status", 401);
                responseData.put("error", "Unauthorized");
                responseData.put("message", "인증이 필요합니다.");
                responseData.put("path", request.getRequestURI());

                ObjectMapper objectMapper = new ObjectMapper();
                response.getWriter().write(objectMapper.writeValueAsString(responseData));

                return ;
            }
        }

        filterChain.doFilter(request, response);
    }

    private boolean isTokenBlacklisted(String token) {
        return Boolean.TRUE.equals(redisTemplate.hasKey("blacklist:" + token));
    }

    private String extractTokenFromHeader(HttpServletRequest request) {
        String header = request.getHeader("Authorization");
        if (header != null && header.startsWith("Bearer ")) {
            return header.substring(7);
        }
        return null;
    }
}
