package com.nowtrip.api.service.post;

import com.nowtrip.api.entity.Comment;
import com.nowtrip.api.entity.Post;
import com.nowtrip.api.entity.User;
import com.nowtrip.api.repository.CommentLikeRepository;
import com.nowtrip.api.repository.CommentRepository;
import com.nowtrip.api.repository.PostRepository;
import com.nowtrip.api.response.post.CommentResponse;
import com.nowtrip.api.service.auth.AuthenticationHelper;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CommentService {
    private final CommentRepository commentRepository;
    private final PostRepository postRepository;
    private final CommentLikeRepository commentLikeRepository;
    private final AuthenticationHelper authenticationHelper;


    public List<CommentResponse> getCommentsByPostId(Long postId) {
        List<Object[]> results = commentRepository.findCommentsWithUserByPostId(postId);

        return results.stream()
                .map(row -> convertToCommentResponse((Comment) row[0], (User) row[1]))
                .collect(Collectors.toList());
    }

    @Transactional
    public CommentResponse createComment(Long postId, String content) {
        Post post = postRepository.findById(postId).orElseThrow(() ->
                new IllegalArgumentException("게시글 ID: " + postId + " 을 찾을 수 없습니다"));

        Comment comment = Comment.builder()
                .content(content)
                .post(post)
                .build();

        commentRepository.save(comment);
        postRepository.incrementCommentCount(postId);
        return convertToCommentResponse(comment, getCurrentUser());
    }

    @Transactional
    public void updateComment(Long commentId, String content) {
        Comment savedComment = commentRepository.findById(commentId)
                .orElseThrow(() -> new IllegalArgumentException("댓글이 존재하지 않습니다"));

        if (isNotMine(commentId)) {
            throw new SecurityException("댓글 변경 권한이 없습니다");
        }

        savedComment.setContent(content);
        commentRepository.save(savedComment);
    }

    @Transactional
    public void deleteComment(Long commentId) {
        Comment savedComment = commentRepository.findById(commentId)
                .orElseThrow(() -> new IllegalArgumentException("댓글이 존재하지 않습니다"));
        Post post = savedComment.getPost();

        if (isNotMine(commentId)) {
            throw new SecurityException("댓글 삭제 권한이 없습니다");
        }

        commentRepository.delete(savedComment);
        postRepository.decrementCommentCount(post.getId());
    }

    private CommentResponse convertToCommentResponse(Comment comment, User user) {
        boolean isLiked = false;

        if (SecurityContextHolder.getContext().getAuthentication() != null &&
                !SecurityContextHolder.getContext().getAuthentication().getName().equals("anonymousUser")) {
            isLiked = commentLikeRepository.existsByCommentIdAndUserId(comment.getId(), getCurrentUserId());
        }

        return new CommentResponse(
                comment.getId(),
                comment.getPost().getId(),
                comment.getContent(),
                comment.getCreatedAt(),
                user.getNickname(),
                user.getProfile(),
                comment.getLikeCount(),
                isLiked
        );
    }

    private Long getCurrentUserId() {
        return authenticationHelper.getCurrentPrincipal().getUserId();
    }

    private User getCurrentUser() {
        return authenticationHelper.getCurrentPrincipal().getUser();
    }

    private boolean isNotMine(Long commentId) {
        Comment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new IllegalArgumentException("댓글이 존재하지 않습니다"));
        return !comment.getCreatedBy().equals(getCurrentUserId());
    }
}
