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
public class CommentResponse {
    private Long id;
    private Long postId;
    private String content;
    private LocalDateTime createdAt;
    private String authorNickname;
    private String authorProfileImage;
    private Integer likeCount;
    private boolean isLiked;
}
