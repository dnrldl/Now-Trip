package com.nowtrip.api.service.post;

import com.nowtrip.api.entity.Country;
import com.nowtrip.api.entity.PostLike;
import com.nowtrip.api.entity.Post;
import com.nowtrip.api.entity.User;
import com.nowtrip.api.exception.UserNotFoundException;
import com.nowtrip.api.repository.*;
import com.nowtrip.api.request.PostRequest;
import com.nowtrip.api.response.post.PostResponse;
import com.nowtrip.api.service.auth.AuthenticationHelper;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PostService {
    private final PostRepository postRepository;
    private final UserRepository userRepository;
    private final CountryRepository countryRepository;
    private final PostLikeRepository likeRepository;
    private final AuthenticationHelper authenticationHelper;
    private static final String UNKNOWN_COUNTRY = "Unknown Country";

    // 게시글 조회 (메인 화면)
    public Page<PostResponse> getPosts(int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        Page<Post> posts = postRepository.findAllWithoutComments(pageable);

        return convertPostsToPostResponses(posts);
    }

    // 게시글 조회 (로그인 유저 내 게시글)
    public Page<PostResponse> getMyPosts(int page, int size) {
        Long userId = getCurrentUserId();
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        Page<Post> posts = postRepository.findAllWithoutCommentsByUserId(userId, pageable);
        return convertPostsToPostResponses(posts);
    }

    // 게시글 조회 (단일)
    public PostResponse getPost(Long id) {
        Post post = postRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("게시글 ID: " + id + " 을 찾을 수 없습니다"));
        return convertPostToPostResponse(post);
    }

    // 국가 코드로 게시글 조회
    public Page<PostResponse> getPostsByCountry(int page, int size, String iso2Code) {
        if (iso2Code == null || iso2Code.isBlank()) {
            throw new IllegalArgumentException("ISO3 코드는 null이거나 빈 값일 수 없습니다");
        }
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        Page<Post> posts = postRepository.findByCountryIso2Code(iso2Code, pageable);

        return convertPostsToPostResponses(posts);
    }

    // 등록
    public Long createPost(PostRequest request) {
        Post post = new Post();
        post.setTitle(request.getTitle());
        post.setContent(request.getContent());
        post.setImageUrl(request.getImageUrl());

        // 국가 코드 설정
        if (request.getIso2Code() != null && !request.getIso2Code().trim().isEmpty()) {
            Country country = countryRepository.findByIso2Code(request.getIso2Code())
                    .orElseThrow(() -> new IllegalArgumentException("유효하지 않은 ISO2 코드입니다: " + request.getIso2Code()));
            post.setCountry(country);
        }

        return postRepository.save(post).getId();
    }

    // 변경
    public void updatePost(Long id, PostRequest request) {
        Post savedPost = postRepository.findById(id).orElseThrow(() ->
                new IllegalArgumentException("게시글 ID: " + id + " 을 찾을 수 없습니다"));

        if (!savedPost.getCreatedBy().equals(getCurrentUserId())) {
            throw new SecurityException("게시글 변경 권한이 없습니다");
        }

        savedPost.setTitle(request.getTitle());
        savedPost.setContent(request.getContent());

        postRepository.save(savedPost);
    }

    // 삭제
    public void deletePost(Long id) {
        Post savedPost = postRepository.findById(id).orElseThrow(() ->
                new IllegalArgumentException("게시글 ID: " + id + " 을 찾을 수 없습니다"));

        if (!savedPost.getCreatedBy().equals(getCurrentUserId())) {
            throw new SecurityException("게시글 삭제 권한이 없습니다");
        }

        postRepository.deleteById(id);
    }

    private Page<PostResponse> convertPostsToPostResponses(Page<Post> posts) {
        List<Long> postIds = posts.stream().map(Post::getId).collect(Collectors.toList());
        List<Long> likedPostIds = new ArrayList<>();

        if (SecurityContextHolder.getContext().getAuthentication() != null &&
                !SecurityContextHolder.getContext().getAuthentication().getName().equals("anonymousUser")) {
            Long currentUserId = authenticationHelper.getCurrentPrincipal().getUserId();
            List<PostLike> likes = likeRepository.findByUserIdAndPostIdIn(currentUserId, postIds);
            likedPostIds = likes.stream().map(like -> like.getPost().getId()).collect(Collectors.toList());
        }

        List<Long> finalLikedPostIds = likedPostIds;
        return posts.map(post -> convertToPostResponse(post, finalLikedPostIds.contains(post.getId())));
    }


    private PostResponse convertPostToPostResponse(Post post) {
        boolean isLiked = false;

        if (SecurityContextHolder.getContext().getAuthentication() != null &&
                !SecurityContextHolder.getContext().getAuthentication().getName().equals("anonymousUser")) {
            Long currentUserId = authenticationHelper.getCurrentPrincipal().getUserId();
            isLiked = likeRepository.existsByPostIdAndUserId(post.getId(), currentUserId);
        }

        return convertToPostResponse(post, isLiked);
    }

    private PostResponse convertToPostResponse(Post post, boolean isLiked) {
        String countryName = Optional.ofNullable(post.getCountry())
                .map(Country::getKoreanName)
                .orElse(UNKNOWN_COUNTRY);

        User author = userRepository.findById(post.getCreatedBy()).orElseThrow(() -> new UserNotFoundException("유저를 찾을 수 없습니다."));

        return new PostResponse(
                post.getId(),
                post.getTitle(),
                post.getContent(),
                post.getImageUrl(),
                countryName,
                post.getCreatedAt(),
                author.getNickname(),
                author.getProfile(),
                post.getLikeCount(),
                post.getCommentCount(),
                post.getViewCount(),
                isLiked
        );
    }

    private Long getCurrentUserId() {
        return authenticationHelper.getCurrentPrincipal().getUserId();
    }
}