package com.nowtrip.api.request;

import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.Pattern;
import lombok.Data;

@Data
public class UserNickNameUpdateRequest {
    @NotEmpty
    @Pattern(regexp = "^[a-zA-Z가-힣\\\\s]{2,15}",
            message = "닉네임은 영문자, 한글, 공백포함 2글자부터 15글자까지 가능합니다.")
    private String nickname;
}
