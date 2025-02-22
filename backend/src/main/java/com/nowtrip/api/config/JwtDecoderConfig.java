package com.nowtrip.api.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.security.oauth2.jwt.NimbusJwtDecoder;

import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;

@Configuration
public class JwtDecoderConfig {
    @Value("${jwt.secret.key}")
    private String SECRET_KEY;
    private final String alg = "HmacSHA256";

    @Bean
    public JwtDecoder jwtDecoder() {
        byte[] keyBytes = SECRET_KEY.getBytes(StandardCharsets.UTF_8);

        return NimbusJwtDecoder
                .withSecretKey(new SecretKeySpec(keyBytes, alg)).build();
    }
}
