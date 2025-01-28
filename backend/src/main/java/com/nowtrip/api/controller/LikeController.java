package com.nowtrip.api.controller;

import com.nowtrip.api.response.post.LikeResponse;
import com.nowtrip.api.service.post.LikeService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/posts")
@RequiredArgsConstructor
public class LikeController {
    private final LikeService likeService;

    @PostMapping("/{postId}/like-toggle")
    public ResponseEntity<LikeResponse> toggleLike(@PathVariable Long postId) {
        LikeResponse response = likeService.toggleLike(postId);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{postId}/likes/status")
    public ResponseEntity<Map<String, Boolean>> getLikeStatus(@PathVariable Long postId) {
        boolean isLiked = likeService.isLiked(postId);
        return ResponseEntity.ok(Map.of("isLiked", isLiked));
    }
}
