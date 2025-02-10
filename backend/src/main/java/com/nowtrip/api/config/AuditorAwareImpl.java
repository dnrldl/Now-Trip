package com.nowtrip.api.config;

import com.nowtrip.api.security.CustomUserDetails;
import org.springframework.data.domain.AuditorAware;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Optional;

public class AuditorAwareImpl implements AuditorAware<String> {
    @Override
    public Optional<String> getCurrentAuditor() {
        // 현재 SecurityContextHolder에서 인증정보 가져오기
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        // 인증이 없거나 익명사용자일 경우
        if (authentication == null || !authentication.isAuthenticated()) {
            return Optional.empty();
        }

        // principal이 CustomUserDetails인 경우
        if (authentication.getPrincipal() instanceof CustomUserDetails customUserDetails) {
            // 닉네임을 반환하
            return Optional.of(customUserDetails.getNickname());
        }

        // 그 외 empty 반환
        return Optional.empty();
    }


}
