package com.nowtrip.api.controller;


import com.nowtrip.api.request.UserProfileRequest;
import com.nowtrip.api.request.UserPwUpdateRequest;
import com.nowtrip.api.request.UserRegistRequest;
import com.nowtrip.api.request.UserNickNameUpdateRequest;
import com.nowtrip.api.response.user.UserInfoResponse;
import com.nowtrip.api.service.user.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {
    private final UserService userService;

    @PostMapping("/register")
    public ResponseEntity<String> signup(@RequestBody @Valid UserRegistRequest request) {
        userService.registerUser(request);
        return new ResponseEntity<>("회원가입 완료", HttpStatus.CREATED);
    }

    @PutMapping("/profile")
    public ResponseEntity<String> updateUserNickname(@RequestBody @Valid UserProfileRequest request) {
        System.out.println("request.getNickname() = " + request.getNickname());
        userService.updateProfile(request);
        return new ResponseEntity<>("프로필 변경 완료", HttpStatus.OK);
    }

    @PutMapping("/password")
    public ResponseEntity<String> updateUserPw(@RequestBody @Valid UserPwUpdateRequest request) {
        userService.updateUserPassword(request);
        return new ResponseEntity<>("비밀번호 변경 완료", HttpStatus.OK);
    }

    @DeleteMapping("/me")
    public ResponseEntity<String> deleteUser() {
        userService.deleteUser();
        return new ResponseEntity<>("유저 탈퇴 완료", HttpStatus.OK);
    }

    @GetMapping("/myinfo")
    public ResponseEntity<UserInfoResponse> myinfo() {
        UserInfoResponse userinfo = userService.getUserInfo();
        return new ResponseEntity<>(userinfo, HttpStatus.OK);
    }
}
