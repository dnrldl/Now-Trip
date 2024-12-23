package com.nowtrip.api.request;

import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.Pattern;
import lombok.Data;

@Data
public class UserRegistRequest {
    @NotEmpty
    @Pattern(regexp = "^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$",
            message = "알맞은 이메일 형식이어야 합니다.")
    private String email;

    @NotEmpty
    @Pattern(regexp = "^(?=.*[A-Za-z])(?=.*\\d)(?=.*[~!@#$%^&*()+|=])[A-Za-z\\d~!@#$%^&*()+|=]{7,16}$",
            message = "비밀번호는 영문+숫자+특수문자를 포함한 8~20자여야 합니다")
    private String password;

    @NotEmpty
    @Pattern(regexp = "^[a-zA-Z가-힣\\\\s]{2,15}",
            message = "이름은 영문자, 한글, 공백포함 2글자부터 15글자까지 가능합니다.")
    private String name;

    @NotEmpty
    @Pattern(regexp = "^[a-zA-Z가-힣\\\\s]{2,15}",
            message = "닉네임은 영문자, 한글, 공백포함 2글자부터 15글자까지 가능합니다.")
    private String nickname;

    @NotEmpty
    @Pattern(regexp = "^(\\+82-?1[0-9]{1}-?[0-9]{3,4}-?[0-9]{4}|0[1-9]{1}[0-9]{1}-?[0-9]{3,4}-?[0-9]{4})$",
            message = "정확한 전화번호를 입력해야 합니다.")
    private String phoneNumber;
}
