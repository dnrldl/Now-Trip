package com.nowtrip.api.controller;

import com.nowtrip.api.request.UserLoginRequest;
import com.nowtrip.api.response.user.UserLoginResponse;
import com.nowtrip.api.security.jwt.JwtProvider;
import com.nowtrip.api.service.auth.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {
    private final AuthService authService;
    private final JwtProvider jwtProvider;

    @PostMapping("/login")
    public ResponseEntity<UserLoginResponse> login(@RequestBody @Valid UserLoginRequest request) {
        UserLoginResponse token = authService.login(request);
        return ResponseEntity.ok(token);
    }

    @PostMapping("/logout")
    public ResponseEntity<Map<String, String>> logout(@RequestHeader("Authorization") String accessToken) {
        authService.logout(accessToken.substring(7));
        return ResponseEntity.ok(Map.of("message", "로그아웃 성공"));
    }

    @PostMapping("/refresh-token")
    public ResponseEntity<Map<String, String>> refreshToken(@RequestBody Map<String, String> request) {
        String newAccessToken = authService.refreshAccessToken(request.get("refreshToken"), request.get("accessToken"));
        return ResponseEntity.ok(Map.of("accessToken", newAccessToken));
    }

    @GetMapping("/validate-token")
    public ResponseEntity<String> validateToken(@RequestHeader("Authorization") String authorizationHeader) {
        if (authorizationHeader == null || !authorizationHeader.startsWith("Bearer ")) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Authorization 헤더가 없습니다.");
        }

        String token = authorizationHeader.substring(7);
        boolean isValid = jwtProvider.validateToken(token);

        if (!isValid) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("유효하지 않은 토큰입니다.");
        }

        return ResponseEntity.ok("토큰이 유효합니다.");
    }

}
