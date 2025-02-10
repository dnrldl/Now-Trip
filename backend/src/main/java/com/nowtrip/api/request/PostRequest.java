package com.nowtrip.api.request;

import jakarta.validation.constraints.Size;
import lombok.*;

import jakarta.validation.constraints.NotBlank;

import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PostRequest {
    @NotBlank(message = "제목은 필수입니다")
    @Size(max = 50, message = "제목은 공백 포함 50자까지 입력할 수 있어요.")
    private String title;

    @NotBlank(message = "내용은 필수로 적어야 해요.")
    private String content;

    @Size(max = 3, message = "국가 코드 3자리나 빈 문자열이 필요해요.")
    private String iso3Code;

    private String imageUrl;
}
