package com.nowtrip.api.response.oAuth;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class OAuthUserDTO {
    private String role;
    private String name;
    private String nickname;
}
