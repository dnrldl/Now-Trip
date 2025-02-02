package com.nowtrip.api.response.post;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class PostResponse {
    private Long id;
    private String title;
    private String content;
    private String country;
    private LocalDateTime createdAt;
    private String createdBy;
    private Integer likeCount;
    private Integer commentCount;
    private Integer viewCount;
    private boolean isLiked;
}
