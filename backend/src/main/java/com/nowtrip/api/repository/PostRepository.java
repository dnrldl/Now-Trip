package com.nowtrip.api.repository;

import com.nowtrip.api.entity.Post;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface PostRepository extends JpaRepository<Post, Long> {
    Page<Post> findByCountryIso2Code(String iso2Code, Pageable pageable);
    @Query("SELECT p FROM Post p ORDER BY p.createdAt DESC")
    Page<Post> findAllWithoutComments(Pageable pageable);

    @Query("SELECT p FROM Post p WHERE p.createdBy = :nickname ORDER BY p.createdAt DESC")
    Page<Post> findAllWithoutCommentsByNickname(@Param("nickname") String nickname, Pageable pageable);

    @Modifying
    @Query("UPDATE Post p SET p.likeCount = p.likeCount + :delta WHERE p.id = :postId")
    void updateLikeCount(@Param("postId") Long postId, @Param("delta") int delta);

    @Modifying
    @Query("UPDATE Post p SET p.commentCount = p.commentCount + 1 WHERE p.id = :postId")
    void incrementCommentCount(@Param("postId") Long postId);

    @Modifying
    @Query("UPDATE Post p SET p.commentCount = p.commentCount - 1 WHERE p.id = :postId")
    void decrementCommentCount(@Param("postId") Long postId);

    @Modifying
    @Query("UPDATE Post p SET p.viewCount = p.viewCount + :views WHERE p.id = :postId")
    void updateViewCount(@Param("postId") Long postId, @Param("views") Integer views);
}
