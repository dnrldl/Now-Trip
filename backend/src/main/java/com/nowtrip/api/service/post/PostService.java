package com.nowtrip.api.service.post;

import com.nowtrip.api.entity.Country;
import com.nowtrip.api.entity.Like;
import com.nowtrip.api.entity.Post;
import com.nowtrip.api.repository.CommentRepository;
import com.nowtrip.api.repository.CountryRepository;
import com.nowtrip.api.repository.LikeRepository;
import com.nowtrip.api.repository.PostRepository;
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
import java.util.stream.Stream;

@Service
@RequiredArgsConstructor
public class PostService {
    private final PostRepository postRepository;
    private final CountryRepository countryRepository;
    private final LikeRepository likeRepository;
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
        String nickname = authenticationHelper.getCurrentUser().getNickname();

        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        Page<Post> posts = postRepository.findAllWithoutCommentsByNickname(nickname, pageable);

        return convertPostsToPostResponses(posts);
    }

    // 게시글 조회 (단일)
    public PostResponse getPost(Long id) {
        Post post = postRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("게시글 ID: " + id + " 을 찾을 수 없습니다"));

        return convertToPostResponse(post);
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

        // 국가 코드
        if (request.getIso2Code() == null || request.getIso2Code().trim().isEmpty()) {
            post.setCountry(null);
        } else {
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
        String nickName = authenticationHelper.getCurrentUser().getNickname();

        if (savedPost.getCreatedBy() == null || !savedPost.getCreatedBy().equals(nickName)) {
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

        String nickName = authenticationHelper.getCurrentUser().getNickname();

        if (savedPost.getCreatedBy() == null || !savedPost.getCreatedBy().equals(nickName)) {
            throw new SecurityException("게시글 삭제 권한이 없습니다");
        }

        postRepository.deleteById(id);
    }

    private Page<PostResponse> convertPostsToPostResponses(Page<Post> posts) {
        List<Long> postIds = posts.stream().map(Post::getId).collect(Collectors.toList());
        List<Long> likedPostIds = new ArrayList<>();

        if (SecurityContextHolder.getContext().getAuthentication() != null &&
                !SecurityContextHolder.getContext().getAuthentication().getName().equals("anonymousUser")) {
            Long currentUserId = authenticationHelper.getCurrentUser().getUserId();
            List<Like> likes = likeRepository.findByUserIdAndPostIdIn(currentUserId, postIds);
            likedPostIds = likes.stream().map(like -> like.getPost().getId()).collect(Collectors.toList());
        }

        List<Long> finalLikedPostIds = likedPostIds;
        return posts.map(post -> {
            String countryName = Optional.ofNullable(post.getCountry())
                    .map(Country::getName)
                    .orElse(UNKNOWN_COUNTRY);

            boolean isLiked = finalLikedPostIds.contains(post.getId());

            return new PostResponse(
                    post.getId(),
                    post.getTitle(),
                    post.getContent(),
                    post.getImageUrl(),
                    countryName,
                    post.getCreatedAt(),
                    post.getCreatedBy(),
                    post.getLikeCount(),
                    post.getCommentCount(),
                    post.getViewCount(),
                    isLiked
            );
        });
    }


    private PostResponse convertToPostResponse(Post post) {
        String countryName = Optional.ofNullable(post.getCountry())
                .map(Country::getName)
                .orElse(UNKNOWN_COUNTRY);
        boolean isLiked = false;

        if (SecurityContextHolder.getContext().getAuthentication() != null &&
                !SecurityContextHolder.getContext().getAuthentication().getName().equals("anonymousUser")) {
            Long currentUserId = authenticationHelper.getCurrentUser().getUserId();
            isLiked = likeRepository.existsByPostIdAndUserId(post.getId(), currentUserId);
        }

        return new PostResponse(
                post.getId(),
                post.getTitle(),
                post.getContent(),
                post.getImageUrl(),
                countryName,
                post.getCreatedAt(),
                post.getCreatedBy(),
                post.getLikeCount(),
                post.getCommentCount(),
                post.getViewCount(),
                isLiked
        );
    }


    /**
     * 테스트 코드
     */
    public Post createTestPosts(String title, String content) {
        Post post =  Post.builder()
                .title(title)
                .content(content)
                .imageUrl("https://picsum.photos/400/500")
                .commentCount(0)
                .likeCount(0)
                .viewCount(0)
                .build();
        post.setCreatedBy("test");
        return post;
    }

    public void generateTestData() {
        if (postRepository.count() != 0)
            return;

        List<Post> posts = new ArrayList<>();

        for (int i = 0; i < 50; i++) {
            posts.add(createTestPosts("테스트" + (i+1), "테스트 내용"));
        }

        // 데이터 저장
        postRepository.saveAll(posts);
        System.out.println("대량의 테스트 데이터가 성공적으로 저장되었습니다");
    }


}