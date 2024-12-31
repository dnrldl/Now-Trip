package com.nowtrip.api.service.post;

import com.nowtrip.api.entity.Country;
import com.nowtrip.api.entity.Post;
import com.nowtrip.api.repository.CountryRepository;
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
    private final CountryRepository countryRepository;

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
        Country country = countryRepository.findByIso3Code(request.getIso3Code())
                .orElseThrow(() -> new IllegalArgumentException("잘못된 국가코드입니다"));

        Post post = Post.builder()
                .title(request.getTitle())
                .content(request.getContent())
                .country(country)
                .build();
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
        List<CommentResponse> commentResponses = post.getComments().stream()
                .map(comment -> new CommentResponse(
                        comment.getId(),
                        comment.getContent(),
                        comment.getCreatedAt(),
                        comment.getUpdatedAt(),
                        comment.getCreatedBy(),
                        comment.getModifiedBy()
                )).collect(Collectors.toList());

        String countryName = (post.getCountry() != null) ? post.getCountry().getCountryName() : "Unknown Country";


        return new PostResponse(
                post.getId(),
                post.getTitle(),
                post.getContent(),
                countryName,
                commentResponses,
                post.getCreatedAt(),
                post.getUpdatedAt(),
                post.getCreatedBy(),
                post.getModifiedBy()
        );
    }
}
