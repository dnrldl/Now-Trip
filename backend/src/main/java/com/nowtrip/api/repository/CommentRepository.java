package com.nowtrip.api.repository;

import com.nowtrip.api.entity.Comment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface CommentRepository extends JpaRepository<Comment, Long> {
    List<Comment> findByPostIdOrderByCreatedAtDesc(Long postId);
    @Query("SELECT c, u FROM Comment c JOIN User u ON c.createdBy = u.id WHERE c.post.id = :postId ORDER BY c.createdAt DESC")
    List<Object[]> findCommentsWithUserByPostId(@Param("postId") Long postId);
}
