package com.nowtrip.api.request;

import jakarta.validation.constraints.Pattern;
import lombok.Data;

@Data
public class UserProfileRequest {
    @Pattern(regexp = "(^$)|(^[a-zA-Z0-9가-힣\\s]{2,15}$)",
            message = "닉네임은 영문자, 한글, 숫자, 공백 포함 2글자부터 15글자까지 가능합니다.")
    private String nickname;
    private String profile;
}
