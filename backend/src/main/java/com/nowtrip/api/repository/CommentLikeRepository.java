package com.nowtrip.api.repository;

import com.nowtrip.api.entity.CommentLike;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface CommentLikeRepository extends JpaRepository<CommentLike, Long> {
    int countByCommentId(Long commentId);
    boolean existsByCommentIdAndUserId(Long commentId, Long userId);

    @Modifying
    @Query("DELETE FROM CommentLike p WHERE p.comment.id = :commentId AND p.user.id = :userId")
    int deleteByCommentIdAndUserId(@Param("commentId") Long commentId, @Param("userId") Long userId);
}
