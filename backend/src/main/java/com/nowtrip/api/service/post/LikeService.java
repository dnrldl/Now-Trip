package com.nowtrip.api.service.post;

import com.nowtrip.api.entity.Like;
import com.nowtrip.api.entity.Post;
import com.nowtrip.api.entity.User;
import com.nowtrip.api.repository.LikeRepository;
import com.nowtrip.api.repository.PostRepository;
import com.nowtrip.api.response.post.LikeResponse;
import com.nowtrip.api.service.auth.AuthenticationHelper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class LikeService {
    private final LikeRepository likeRepository;
    private final PostRepository postRepository;
    private final AuthenticationHelper authenticationHelper;

    @Transactional
    public LikeResponse toggleLike(Long postId) {
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new IllegalArgumentException("게시글을 찾을 수 없습니다."));
        Long userId = authenticationHelper.getCurrentPrincipal().getUserId();

        // 좋아요 여부 확인
        int deletedRow = likeRepository.deleteByPostIdAndUserId(postId, userId);

        if (deletedRow > 0) {
            // 좋아요 상태 -> 좋아요 수 감소
            postRepository.updateLikeCount(postId, -1);
            return new LikeResponse(false, likeRepository.countByPostId(postId)); // 좋아요 삭제 상태
        } else {
            // 좋아요 X 상태 -> 좋아요 수 증가
            Like like = Like.builder()
                    .post(post)
                    .user(new User(userId))
                    .build();
            likeRepository.save(like);
            postRepository.updateLikeCount(postId, 1);
            return new LikeResponse(true, likeRepository.countByPostId(postId)); // 좋아요 추가 상태
        }
    }

    public boolean isLiked(Long postId) {
        Long userId = authenticationHelper.getCurrentPrincipal().getUserId();
        return likeRepository.existsByPostIdAndUserId(postId, userId);
    }

    // 좋아요 수 검증
    @Transactional
    public void recalculateLikeCount(Long postId) {
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new IllegalArgumentException("게시글을 찾을 수 없습니다."));

        int actualLikeCount = likeRepository.countByPostId(postId);
        post.setLikeCount(actualLikeCount);
        postRepository.save(post);
    }
}
