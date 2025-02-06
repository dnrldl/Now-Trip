package com.nowtrip.api.service.post;

import com.nowtrip.api.entity.Country;
import com.nowtrip.api.entity.Like;
import com.nowtrip.api.entity.Post;
import com.nowtrip.api.entity.PostImage;
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
    private final CountryRepository countryRepository;
    private final LikeRepository likeRepository;
    private final PostImageRepository postImageRepository;
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
        String email = authenticationHelper.getCurrentUser().getUsername();

        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        Page<Post> posts = postRepository.findAllWithoutCommentsByEmail(email, pageable);

        return posts.map(this::convertToPostResponse);
    }

    // 게시글 조회 (단일)
    public PostResponse getPost(Long id) {
        Post post = postRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("게시글 ID: " + id + " 을 찾을 수 없습니다"));

        return convertToPostResponse(post);
    }

    // 국가 코드로 게시글 조회
    public List<PostResponse> getPostsByCountry(String iso3Code) {
        if (iso3Code == null || iso3Code.isBlank()) {
            throw new IllegalArgumentException("ISO3 코드는 null이거나 빈 값일 수 없습니다");
        }

        return postRepository.findByCountryIso3Code(iso3Code).stream()
                .map(this::convertToPostResponse)
                .collect(Collectors.toList());
    }

    // 게시글 등록
    public Long createPost(PostRequest request) {
        Post post = Post.builder()
                .title(request.getTitle())
                .content(request.getContent())
                .build();

        // 국가 코드 저장
        if (request.getIso3Code() == null || request.getIso3Code().trim().isEmpty()) {
            post.setCountry(null);
        } else {
            Country country = countryRepository.findByIso3Code(request.getIso3Code())
                    .orElseThrow(() -> new IllegalArgumentException("유효하지 않은 ISO3 코드입니다: " + request.getIso3Code()));
            post.setCountry(country);
        }

        // 이미지 저장
        for (String imageUrl : request.getImageUrls()) {
            PostImage postImage = PostImage.builder()
                    .imageUrl(imageUrl)
                    .post(post)
                    .build();
            postImageRepository.save(postImage);
        }

        return postRepository.save(post).getId();
    }

    // 게시글 변경
    public void updatePost(Long id, PostRequest request) {
        Post savedPost = postRepository.findById(id).orElseThrow(() ->
                new IllegalArgumentException("게시글 ID: " + id + " 을 찾을 수 없습니다"));
        String currentEmail = SecurityContextHolder.getContext().getAuthentication().getName();

        if (savedPost.getCreatedBy() == null || !savedPost.getCreatedBy().equals(currentEmail)) {
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

        String currentEmail = SecurityContextHolder.getContext().getAuthentication().getName();

        if (savedPost.getCreatedBy() == null || !savedPost.getCreatedBy().equals(currentEmail)) {
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
                    post.getImages().stream().map(PostImage::getImageUrl).collect(Collectors.toList()),
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
                post.getImages().stream().map(PostImage::getImageUrl).collect(Collectors.toList()),
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
        Post post = Post.builder()
                .title(title)
                .content(content)
                .commentCount(0)
                .likeCount(0)
                .viewCount(0)
                .build();
        post.setCreatedBy("test@test.com");

        return post;
    }

    public List<PostImage> createTestPostImages(Post post) {
        List<PostImage> images = new ArrayList<>();

        for (int i = 0; i < 3; i++) {
            PostImage postImage = PostImage.builder()
                    .post(post)
                    .imageUrl("https://picsum.photos/400/500?random=" + i)
                    .build();
            images.add(postImage);
        }

        return images;
    }

    public void generateTestData() {
        if (postRepository.count() != 0)
            return;

        List<Post> posts = new ArrayList<>();
        List<PostImage> postImages = new ArrayList<>();

        for (int i = 0; i < 50; i++) {
            Post post = createTestPosts("테스트" + (i+1), "테스트 내용");
            posts.add(post);

            postImages.addAll(createTestPostImages(post));
        }

        // 데이터 저장
        postRepository.saveAll(posts);
        postImageRepository.saveAll(postImages);
        System.out.println("대량의 테스트 데이터가 성공적으로 저장되었습니다");
    }


}
