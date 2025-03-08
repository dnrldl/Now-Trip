package com.nowtrip.api.repository;

import com.nowtrip.api.entity.PostLike;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface PostLikeRepository extends JpaRepository<PostLike, Long> {
    boolean existsByPostIdAndUserId(Long postId, Long userId);
    int countByPostId(Long postId);

    @Modifying
    @Query("DELETE FROM PostLike p WHERE p.post.id = :postId AND p.user.id = :userId")
    int deleteByPostIdAndUserId(@Param("postId") Long postId, @Param("userId") Long userId);

    List<PostLike> findByUserIdAndPostIdIn(Long userId, List<Long> postIds);
}
