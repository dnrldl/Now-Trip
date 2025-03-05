package com.nowtrip.api.config;

import com.nowtrip.api.security.PrincipalDetails;
import org.springframework.data.domain.AuditorAware;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

import java.util.Optional;

public class AuditorAwareImpl implements AuditorAware<Long> {
    @Override
    public Optional<Long> getCurrentAuditor() {
        // 현재 SecurityContextHolder에서 인증정보 가져오기
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        // 인증이 없거나 익명사용자일 경우
        if (authentication == null || !authentication.isAuthenticated()) {
            return Optional.empty();
        }

        // principal이 CustomUserDetails인 경우
        if (authentication.getPrincipal() instanceof PrincipalDetails customUserDetails) {
            return Optional.ofNullable(customUserDetails.getUserId());
        }

        // 그 외 empty 반환
        return Optional.empty();
    }


}
