package com.nowtrip.api.request;

import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.Pattern;
import lombok.Data;

@Data
public class UserLoginRequest {
//    @NotEmpty
//    @Pattern(regexp = "^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$",
//            message = "알맞은 이메일 형식이어야 합니다.")
    private String email;

//    @NotEmpty
//    @Pattern(regexp = "^(?=.*[A-Za-z])(?=.*\\d)(?=.*[~!@#$%^&*()+|=])[A-Za-z\\d~!@#$%^&*()+|=]{7,16}$",
//            message = "비밀번호는 영문+숫자+특수문자를 포함한 8~20자여야 합니다")
    private String password;
}
