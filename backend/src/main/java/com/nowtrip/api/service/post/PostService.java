package com.nowtrip.api.service.post;

import com.nowtrip.api.entity.Country;
import com.nowtrip.api.entity.Post;
import com.nowtrip.api.repository.CountryRepository;
import com.nowtrip.api.repository.PostRepository;
import com.nowtrip.api.request.PostRequest;
import com.nowtrip.api.response.post.PostResponse;
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

//    public List<PostResponse> getPosts() {
//        List<Post> posts = postRepository.findAllWithoutComments();
//
//        return posts.stream()
//                .map(this::convertToPostResponse)
//                .collect(Collectors.toList());
//    }

    // 페이징 처리
    public Page<PostResponse> getPosts(int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        Page<Post> posts = postRepository.findAllWithoutComments(pageable);

        return posts.map(this::convertToPostResponse);
    }

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

    public Long createPostByCountry(PostRequest request) {
        Post post = new Post();
        post.setTitle(request.getTitle());
        post.setContent(request.getContent());

        if (request.getIso3Code() == null || request.getIso3Code().trim().isEmpty()) {
            post.setCountry(null);
        } else {
            Country country = countryRepository.findByIso3Code(request.getIso3Code())
                    .orElseThrow(() -> new IllegalArgumentException("유효하지 않은 ISO3 코드입니다: " + request.getIso3Code()));
            post.setCountry(country);
        }

        return postRepository.save(post).getId();
    }

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

    public void deletePost(Long id) {
        Post savedPost = postRepository.findById(id).orElseThrow(() ->
                new IllegalArgumentException("게시글 ID: " + id + " 을 찾을 수 없습니다"));

        String currentEmail = SecurityContextHolder.getContext().getAuthentication().getName();

        if (savedPost.getCreatedBy() == null || !savedPost.getCreatedBy().equals(currentEmail)) {
            throw new SecurityException("게시글 삭제 권한이 없습니다");
        }

        postRepository.deleteById(id);
    }


    private PostResponse convertToPostResponse(Post post) {
//        List<CommentResponse> commentResponses = post.getComments().stream()
//                .map(comment -> new CommentResponse(
//                        comment.getId(),
//                        comment.getContent(),
//                        comment.getCreatedAt(),
//                        comment.getUpdatedAt(),
//                        comment.getCreatedBy(),
//                        comment.getModifiedBy()
//                )).collect(Collectors.toList());

        String countryName = Optional.ofNullable(post.getCountry())
                .map(Country::getCountryName)
                .orElse("Unknown Country");

        return new PostResponse(
                post.getId(),
                post.getTitle(),
                post.getContent(),
                countryName,
//                commentResponses,
                post.getCreatedAt(),
                post.getUpdatedAt(),
                post.getCreatedBy(),
                post.getModifiedBy()
        );
    }

    public Post createTestPosts(String title, String content) {
        Post post = Post.builder()
                .title(title)
                .content(content)
                .build();
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
