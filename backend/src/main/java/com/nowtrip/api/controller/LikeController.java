package com.nowtrip.api.controller;

import com.nowtrip.api.response.post.LikeResponse;
import com.nowtrip.api.service.post.LikeService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class LikeController {
    private final LikeService likeService;

    @PostMapping("/posts/{postId}/like")
    public ResponseEntity<LikeResponse> togglePostLike(@PathVariable Long postId) {
        LikeResponse response = likeService.togglePostLike(postId);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/comments/{commentId}/like")
    public ResponseEntity<LikeResponse> toggleCommentLike(@PathVariable Long commentId) {
        LikeResponse response = likeService.toggleCommentLike(commentId);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/posts/{postId}/like")
    public ResponseEntity<Boolean> isPostLiked(@PathVariable Long postId) {
        return ResponseEntity.ok(likeService.isPostLiked(postId));
    }

    @GetMapping("/comments/{commentId}/like")
    public ResponseEntity<Boolean> isCommentLiked(@PathVariable Long commentId) {
        return ResponseEntity.ok(likeService.isCommentLiked(commentId));
    }
}
