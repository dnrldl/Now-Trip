package com.nowtrip.api.repository;

import com.nowtrip.api.entity.Like;
import com.nowtrip.api.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface LikeRepository extends JpaRepository<Like, Long> {
    boolean existsByPostIdAndUserId(Long postId, Long userId);
    Optional<Like> findByPostIdAndUserId(Long postId, Long userId);
    int countByPostId(Long postId);

    @Modifying
    @Query("DELETE FROM Like l WHERE l.post.id = :postId AND l.user.id = :userId")
    int deleteByPostIdAndUserId(@Param("postId") Long postId, @Param("userId") Long userId);

    //
    List<Like> findByUserIdAndPostIdIn(Long userId, List<Long> postIds);
}
