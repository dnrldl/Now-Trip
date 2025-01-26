package com.nowtrip.api.response.post;

import lombok.*;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class LikeResponse {
    private boolean isLiked;
    private int likedCount;
}
