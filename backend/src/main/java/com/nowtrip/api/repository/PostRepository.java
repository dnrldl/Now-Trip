package com.nowtrip.api.repository;

import com.nowtrip.api.entity.Post;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;

public interface PostRepository extends JpaRepository<Post, Long> {
    @Query(value = "SELECT p FROM Post p WHERE p.country.iso2Code = :iso2Code",
            countQuery = "SELECT count(p) FROM Post p WHERE p.country.iso2Code = :iso2Code")
    Page<Post> findByCountryIso2Code(@Param("iso2Code") String iso2Code, Pageable pageable);

    @Query("SELECT p FROM Post p")
    Page<Post> findAllPosts(Pageable pageable);

    @Query("SELECT p FROM Post p WHERE p.createdBy = :userId ORDER BY p.createdAt DESC")
    Page<Post> findAllWithoutCommentsByUserId(@Param("userId") Long userId, Pageable pageable);

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

    @Query("SELECT p FROM Post p WHERE p.createdAt >= :startDate")
    Page<Post> findByCreatedAtAfter(@Param("startDate")LocalDateTime startDate, Pageable pageable);

    @Query("SELECT p FROM Post p WHERE p.country.iso2Code = :iso2Code AND p.createdAt >= :startDate")
    Page<Post> findByCountryAndCreatedAtAfter(@Param("iso2Code")String iso2Code, @Param("startDate")LocalDateTime startDate, Pageable pageable);

    @Query("SELECT p FROM Post p WHERE p.country IS NULL AND p.createdAt >= :startDate")
    Page<Post> findPostsWithNullCountry(@Param("startDate")LocalDateTime startDate, Pageable pageable);
}
