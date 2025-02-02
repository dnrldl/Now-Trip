package com.nowtrip.api.controller;

import com.nowtrip.api.request.PostRequest;
import com.nowtrip.api.response.post.PostResponse;
import com.nowtrip.api.response.post.PostViewCountService;
import com.nowtrip.api.service.post.PostService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/posts")
public class PostController {
    private final PostService postService;
    private final PostViewCountService postViewCountService;

    @PostMapping
    public ResponseEntity<String> createPostByCountry(@RequestBody @Valid PostRequest request) {
        Long id = postService.createPostByCountry(request);
        return ResponseEntity.status(HttpStatus.CREATED).body("게시글이 등록되었습니다. id: " + id);
    }

    @GetMapping
    public ResponseEntity<Page<PostResponse>> getAllPosts(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        return ResponseEntity.ok(postService.getPosts(page, size));
    }

    @GetMapping("/myPosts")
    public ResponseEntity<Page<PostResponse>> getMyPosts(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        return ResponseEntity.ok(postService.getMyPosts(page, size));
    }

    @GetMapping("/{id}")
    public ResponseEntity<PostResponse> getPost(@PathVariable Long id, HttpServletRequest request) {
        postViewCountService.increaseViewCount(id, request.getRemoteAddr()); // 사용자 ip
        PostResponse postResponse = postService.getPost(id);
        return ResponseEntity.ok(postResponse);
    }

    @GetMapping("/country/{iso3Code}")
    public ResponseEntity<List<PostResponse>> getAllPostsByCountry(@PathVariable String iso3Code) {
        List<PostResponse> postResponses = postService.getPostsByCountry(iso3Code);
        return ResponseEntity.ok(postResponses);
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
