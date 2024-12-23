package com.nowtrip.api.controller;

import com.nowtrip.api.request.CommentRequest;
import com.nowtrip.api.response.post.CommentResponse;
import com.nowtrip.api.service.post.CommentService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/posts/{postId}/comments")
@RequiredArgsConstructor
public class CommentController {
    private final CommentService commentService;

    @PostMapping
    public ResponseEntity<String> createComment(@PathVariable Long postId, @RequestBody CommentRequest request) {
        commentService.createComment(postId, request.getContent());
        return ResponseEntity.status(HttpStatus.CREATED).body("id: " + postId + "의 댓글이 등록되었습니다");
    }

    @GetMapping
    public ResponseEntity<List<CommentResponse>> getComments(@PathVariable Long postId) {
        List<CommentResponse> comments = commentService.getCommentsByPostId(postId);
        return ResponseEntity.ok(comments);
    }

    @PutMapping("/{commentId}")
    public ResponseEntity<String> updateComment(@PathVariable Long commentId, @RequestBody CommentRequest request) {
        commentService.updateComment(commentId, request.getContent());
        return ResponseEntity.ok("댓글이 수정되었습니다");
    }

    @DeleteMapping("/{commentId}")
    public ResponseEntity<Void> deleteComment(@PathVariable Long commentId) {
        commentService.deleteComment(commentId);
        return ResponseEntity.noContent().build();
    }
}
