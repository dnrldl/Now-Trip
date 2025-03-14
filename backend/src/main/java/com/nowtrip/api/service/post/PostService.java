package com.nowtrip.api.service.post;

import com.nowtrip.api.entity.Country;
import com.nowtrip.api.entity.Post;
import com.nowtrip.api.entity.PostLike;
import com.nowtrip.api.entity.User;
import com.nowtrip.api.exception.UserNotFoundException;
import com.nowtrip.api.repository.CountryRepository;
import com.nowtrip.api.repository.PostLikeRepository;
import com.nowtrip.api.repository.PostRepository;
import com.nowtrip.api.repository.UserRepository;
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

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Objects;
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
        Page<Post> posts = postRepository.findAllPosts(pageable);

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

    // 게시글 필터링 조회
    public Page<PostResponse> getFilteredPosts(int page, int size, String iso2Code, String sortBy, String period) {
        Pageable pageable = switch (sortBy.toLowerCase()) {
            case "latest" ->
                    PageRequest.of(page, size, Sort.by("createdAt").descending());
            case "likes" -> // 좋아요 수 기준
                    PageRequest.of(page, size, Sort.by("likeCount").descending());
            case "views" -> // 조회수 기준
                    PageRequest.of(page, size, Sort.by("viewCount").descending());
            case "comments" -> // 댓글 수 기준
                    PageRequest.of(page, size, Sort.by("commentCount").descending());
            default -> // 최신순 (기본값)
                    PageRequest.of(page, size, Sort.by("createdAt").descending());
        };

        // 정렬 기준 설정 (기본: 최신순)

        Page<Post> posts;
        LocalDateTime endDate = LocalDateTime.now();
        LocalDateTime startDate = switch (period) {
            case "daily" -> endDate.minusDays(1);
            case "weekly" -> endDate.minusWeeks(1);
            case "monthly" -> endDate.minusMonths(1);
            case "yearly" -> endDate.minusYears(1);
            case "all" -> LocalDateTime.of(1970,1,1,0,0);
            default -> LocalDateTime.of(1970,1,1,0,0);
        };

        // 특정 국가별 필터링
        if ("free".equalsIgnoreCase(iso2Code)) {
            posts = postRepository.findPostsWithNullCountry(startDate, pageable);
        } else if (iso2Code != null && !iso2Code.trim().isEmpty()) {
            posts = postRepository.findByCountryAndCreatedAtAfter(iso2Code.toLowerCase(), startDate, pageable);
        } else {
            posts = postRepository.findByCreatedAtAfter(startDate, pageable);
        }

        return convertPostsToPostResponses(posts);
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