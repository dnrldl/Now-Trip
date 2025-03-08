package com.nowtrip.api.service.post;

import com.nowtrip.api.entity.*;
import com.nowtrip.api.repository.CommentLikeRepository;
import com.nowtrip.api.repository.CommentRepository;
import com.nowtrip.api.repository.PostLikeRepository;
import com.nowtrip.api.repository.PostRepository;
import com.nowtrip.api.response.post.LikeResponse;
import com.nowtrip.api.service.auth.AuthenticationHelper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class LikeService {
    private final PostLikeRepository postLikeRepository;
    private final PostRepository postRepository;
    private final CommentLikeRepository commentLikeRepository;
    private final CommentRepository commentRepository;
    private final AuthenticationHelper authenticationHelper;

    @Transactional
    public LikeResponse togglePostLike(Long postId) {
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new IllegalArgumentException("게시글을 찾을 수 없습니다."));
        Long userId = authenticationHelper.getCurrentPrincipal().getUserId();

        // 좋아요 여부 확인
        int deletedRow = postLikeRepository.deleteByPostIdAndUserId(postId, userId);

        if (deletedRow > 0) {
            // 좋아요 상태 -> 좋아요 수 감소
            postRepository.updateLikeCount(postId, -1);
            return new LikeResponse(false, postLikeRepository.countByPostId(postId)); // 좋아요 삭제 상태
        } else {
            // 좋아요 X 상태 -> 좋아요 수 증가
            PostLike like = PostLike.builder()
                    .post(post)
                    .user(new User(userId))
                    .build();
            postLikeRepository.save(like);
            postRepository.updateLikeCount(postId, 1);
            return new LikeResponse(true, postLikeRepository.countByPostId(postId)); // 좋아요 추가 상태
        }
    }

    @Transactional
    public LikeResponse toggleCommentLike(Long commentId) {
        Comment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new IllegalArgumentException("댓글을 찾을 수 없습니다."));
        Long userId = authenticationHelper.getCurrentPrincipal().getUserId();

        int deletedRow = commentLikeRepository.deleteByCommentIdAndUserId(commentId, userId);

        if (deletedRow > 0) {
            commentRepository.updateLikeCount(commentId, -1);
            return new LikeResponse(false, commentLikeRepository.countByCommentId(commentId));
        } else {
            CommentLike like = CommentLike.builder()
                    .comment(comment)
                    .user(new User(userId))
                    .build();
            commentLikeRepository.save(like);
            commentRepository.updateLikeCount(commentId, 1);
            return new LikeResponse(true, commentLikeRepository.countByCommentId(commentId));
        }
    }

    public boolean isPostLiked(Long postId) {
        Long userId = authenticationHelper.getCurrentPrincipal().getUserId();
        return postLikeRepository.existsByPostIdAndUserId(postId, userId);
    }

    public boolean isCommentLiked(Long commentId) {
        Long userId = authenticationHelper.getCurrentPrincipal().getUserId();
        return commentLikeRepository.existsByCommentIdAndUserId(commentId, userId);
    }
}
