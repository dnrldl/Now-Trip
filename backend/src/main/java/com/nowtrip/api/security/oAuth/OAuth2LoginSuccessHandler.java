package com.nowtrip.api.security.oAuth;

import com.nowtrip.api.security.PrincipalDetails;
import com.nowtrip.api.security.jwt.JwtProvider;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.security.core.Authentication;
import org.springframework.security.web.authentication.SimpleUrlAuthenticationSuccessHandler;
import org.springframework.stereotype.Component;
import org.springframework.web.util.UriComponentsBuilder;

import java.io.IOException;
import java.util.concurrent.TimeUnit;

@Component
@RequiredArgsConstructor
public class OAuth2LoginSuccessHandler extends SimpleUrlAuthenticationSuccessHandler {
    private final JwtProvider jwtProvider;
    private final RedisTemplate<String, String> redisTemplate;

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request, HttpServletResponse response, Authentication authentication) throws IOException, ServletException {
        PrincipalDetails principal = (PrincipalDetails) authentication.getPrincipal();
        Long userId = principal.getUserId();

        String accessToken = jwtProvider.generateAccessToken(authentication);
        String refreshToken = jwtProvider.generateRefreshToken(authentication);

        // Redis에 Refresh Token 저장
        Long expiration = jwtProvider.extractExpiration(refreshToken);
        long ttl = expiration - System.currentTimeMillis();
        redisTemplate.opsForValue().set("refreshToken:" + userId, refreshToken, ttl, TimeUnit.MILLISECONDS);


        // 클라이언트에서 보낸 uri 파라미터
        String redirectUri = request.getParameter("redirect_uri");
        if (redirectUri == null || redirectUri.isEmpty()) {
            redirectUri = "exp://callback";
        }

        // 최종 리다이렉트 할 url e.g. nowtip://calback?accessToken=???&refreshToken=???
        String targetUrl = UriComponentsBuilder.fromUriString(redirectUri)
                .queryParam("accessToken", accessToken)
                .queryParam("refreshToken", refreshToken)
                .build()
                .toString();

        getRedirectStrategy().sendRedirect(request, response, targetUrl);
    }
}
