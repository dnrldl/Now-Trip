package com.nowtrip.api.request;

import jakarta.validation.constraints.Size;
import lombok.*;

import jakarta.validation.constraints.NotBlank;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PostRequest {
    @NotBlank(message = "제목은 필수입니다")
    @Size(max = 20, message = "제목은 최대 20자까지 입력 가능합니다")
    private String title;

    @NotBlank(message = "내용은 필수입니다")
    private String content;

    @Size(max = 3, min = 3, message = "국가 코드 3자리가 필요합니다")
    private String iso3Code;
}
