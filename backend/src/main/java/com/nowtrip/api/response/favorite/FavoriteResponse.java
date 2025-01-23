package com.nowtrip.api.response.favorite;

import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class FavoriteResponse {
    private Long id;
    private Long userId;
    private Long countryId;
    private LocalDateTime createdAt;
}
