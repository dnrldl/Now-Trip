package com.nowtrip.api.security.jwt;

import com.nowtrip.api.security.CustomUserDetails;
import com.nowtrip.api.security.CustomUserDetailsService;
import io.jsonwebtoken.ExpiredJwtException;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.List;

/**
 * HTTP 요청에서 헤더의 JWT토큰을 추출 후 유효성 검사
 * 인증된 사용자 정보를 SecurityContext에 설정
 *
 * UsernamePasswordAuthenticationToken에서
 * 사용자 이름(username), 비밀번호(password), 권한(Authorities)을 설정할 수 있지만
 * JWT토큰 인증 방식에선 비밀번호를 사용하지 않고 권한이 JWT안에 포함되어있기 때문에
 * Credencial을 null로 설정
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
                if (!jwtProvider.validateToken(token))
                    throw new ExpiredJwtException(null, null, "토큰이 만료되었습니다");

                if (isTokenBlacklisted(token))
                    throw new IllegalArgumentException("블랙리스트에 있는 토큰입니다");

                String email = jwtProvider.extractUsername(token);
                CustomUserDetails userDetails = (CustomUserDetails) userDetailsService.loadUserByUsername(email);

                Authentication authentication = new UsernamePasswordAuthenticationToken(
                        userDetails,
                        null,
                        userDetails.getAuthorities()
                );

                SecurityContextHolder.getContext().setAuthentication(authentication);
            } catch (ExpiredJwtException ex) {
                sendErrorResponse(response, HttpServletResponse.SC_UNAUTHORIZED, ex.getMessage());
                return;
            } catch (IllegalArgumentException ex) {
                sendErrorResponse(response, HttpServletResponse.SC_UNAUTHORIZED, ex.getMessage());
                return;
            }
        }

        filterChain.doFilter(request, response);
    }

    private boolean isTokenBlacklisted(String token) {
        return redisTemplate.hasKey("blacklist:" + token);
    }

    private String extractTokenFromHeader(HttpServletRequest request) {
        String header = request.getHeader("Authorization");
        if (header != null && header.startsWith("Bearer ")) {
            return header.substring(7);
        }
        return null;
    }

    private void sendErrorResponse(HttpServletResponse response, int status, String message) throws IOException {
        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");
        response.setStatus(status);
        response.getWriter().write("{\"error\": \"" + message + "\"}");
    }
}
