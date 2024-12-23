package com.nowtrip.api.service.post;

import com.nowtrip.api.entity.Post;
import com.nowtrip.api.repository.PostRepository;
import com.nowtrip.api.request.PostRequest;
import com.nowtrip.api.response.post.CommentResponse;
import com.nowtrip.api.response.post.PostResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PostService {
    private final PostRepository postRepository;

    public List<PostResponse> getPosts() {
        List<Post> posts = postRepository.findAll();

        return posts.stream()
                .map(this::convertToPostResponse)
                .collect(Collectors.toList());
    }

    public PostResponse getPost(Long id) {
        Post post = postRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("게시글 ID: " + id + " 을 찾을 수 없습니다"));

        return convertToPostResponse(post);
    }

    public Long createPost(PostRequest request) {
        Post post = Post.builder()
                .title(request.getTitle())
                .content(request.getContent())
                .build();
        return postRepository.save(post).getId();
    }

    public void updatePost(Long id, PostRequest request) {
        Post savedPost = postRepository.findById(id).orElseThrow(() ->
                new IllegalArgumentException("게시글 ID: " + id + " 을 찾을 수 없습니다"));
        String currentEmail = SecurityContextHolder.getContext().getAuthentication().getName();

        if (!savedPost.getCreatedBy().equals(currentEmail))
            throw new SecurityException("게시글 변경 권한이 없습니다");

        savedPost.setTitle(request.getTitle());
        savedPost.setContent(request.getContent());

        postRepository.save(savedPost);
    }

    public void deletePost(Long id) {
        Post savedPost = postRepository.findById(id).orElseThrow(() ->
                new IllegalArgumentException("게시글 ID: " + id + " 을 찾을 수 없습니다"));

        String currentEmail = SecurityContextHolder.getContext().getAuthentication().getName();

        if (!savedPost.getCreatedBy().equals(currentEmail))
            throw new SecurityException("게시글 삭제 권한이 없습니다");

        postRepository.deleteById(id);
    }


    private PostResponse convertToPostResponse(Post post) {
        List<CommentResponse> commentResponses = post.getComments().stream()
                .map(comment -> new CommentResponse(
                        comment.getId(),
                        comment.getContent(),
                        comment.getCreatedAt(),
                        comment.getUpdatedAt(),
                        comment.getCreatedBy(),
                        comment.getModifiedBy()
                )).collect(Collectors.toList());

        return new PostResponse(
                post.getId(),
                post.getTitle(),
                post.getContent(),
                commentResponses,
                post.getCreatedAt(),
                post.getUpdatedAt(),
                post.getCreatedBy(),
                post.getModifiedBy()
        );
    }
}
