package com.nowtrip.api.controller;

import com.nowtrip.api.request.PostRequest;
import com.nowtrip.api.response.post.PostResponse;
import com.nowtrip.api.service.post.PostService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/posts")
public class PostController {
    private final PostService postService;

    @PostMapping
    public ResponseEntity<String> createPost(@RequestBody @Valid PostRequest request) {
        Long id = postService.createPost(request);
        return ResponseEntity.status(HttpStatus.CREATED).body("게시글이 등록되었습니다. id: " + id);
    }

    @GetMapping
    public ResponseEntity<List<PostResponse>> getAllPosts() {
        List<PostResponse> postResponses = postService.getPosts();
        return ResponseEntity.ok(postResponses);
    }

    @GetMapping("{id}")
    public ResponseEntity<PostResponse> getPost(@PathVariable Long id) {
        PostResponse postResponse = postService.getPost(id);
        return ResponseEntity.ok(postResponse);
    }

    @PutMapping("/{id}")
    public ResponseEntity<String> updatePost(@PathVariable Long id, @RequestBody @Valid PostRequest request) {
        postService.updatePost(id, request);
        return ResponseEntity.ok("게시글이 수정되었습니다");
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletePost(@PathVariable Long id) {
        postService.deletePost(id);
        return ResponseEntity.noContent().build();
    }
}
