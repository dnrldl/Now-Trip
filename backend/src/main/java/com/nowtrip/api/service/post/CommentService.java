package com.nowtrip.api.service.post;

import com.nowtrip.api.entity.Comment;
import com.nowtrip.api.entity.Post;
import com.nowtrip.api.repository.CommentRepository;
import com.nowtrip.api.repository.PostRepository;
import com.nowtrip.api.response.post.CommentResponse;
import com.nowtrip.api.response.post.PostResponse;
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

    public List<CommentResponse> getCommentsByPostId(Long postId) {
        List<Comment> comments = commentRepository.findByPostId(postId);

        return comments.stream()
                .map(this::convertToCommentResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public Comment createComment(Long postId, String content) {
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new IllegalArgumentException("게시글이 존재하지 않습니다"));

        Comment comment = Comment.builder()
                .content(content)
                .post(post)
                .build();
        return commentRepository.save(comment);
    }

    @Transactional
    public void updateComment(Long commentId, String content) {
        Comment savedComment = commentRepository.findById(commentId)
                .orElseThrow(() -> new IllegalArgumentException("댓글이 존재하지 않습니다"));
        String currentEmail = SecurityContextHolder.getContext().getAuthentication().getName();

        if (!savedComment.getCreatedBy().equals(currentEmail))
            throw new SecurityException("댓글 변경 권한이 없습니다");

        savedComment.setContent(content);
        commentRepository.save(savedComment);
    }

    @Transactional
    public void deleteComment(Long commentId) {
        Comment savedComment = commentRepository.findById(commentId)
                .orElseThrow(() -> new IllegalArgumentException("댓글이 존재하지 않습니다"));
        Post postAuthor = savedComment.getPost();
        String currentEmail = SecurityContextHolder.getContext().getAuthentication().getName();

        if (!savedComment.getCreatedBy().equals(currentEmail)
            || !postAuthor.getCreatedBy().equals(currentEmail))
            throw new SecurityException("댓글 삭제 권한이 없습니다");

        commentRepository.deleteById(commentId);
    }

    private CommentResponse convertToCommentResponse(Comment comment) {
        return new CommentResponse(
                comment.getId(),
                comment.getContent(),
                comment.getCreatedAt(),
                comment.getUpdatedAt(),
                comment.getCreatedBy(),
                comment.getModifiedBy()
        );
    }
}
