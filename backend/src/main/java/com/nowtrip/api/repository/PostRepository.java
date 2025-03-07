package com.nowtrip.api.repository;

import com.nowtrip.api.entity.Post;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface PostRepository extends JpaRepository<Post, Long> {
    @Query(value = "SELECT p FROM Post p WHERE p.country.iso2Code = :iso2Code",
            countQuery = "SELECT count(p) FROM Post p WHERE p.country.iso2Code = :iso2Code")
    Page<Post> findByCountryIso2Code(@Param("iso2Code") String iso2Code, Pageable pageable);

    @Query("SELECT p FROM Post p ORDER BY p.createdAt DESC")
    Page<Post> findAllWithoutComments(Pageable pageable);

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

    // User 정보를 한 번의 쿼리로 가져오기
    @Query("SELECT p FROM Post p JOIN FETCH p.createdBy ORDER BY p.createdAt DESC")
    Page<Post> findAllWithUser(Pageable pageable);

    // 국가별 게시글 조회 시 User 정보 포함
    @Query("SELECT p FROM Post p JOIN FETCH p.createdBy WHERE p.country.iso2Code = :iso2Code")
    Page<Post> findByCountryWithUser(@Param("iso2Code") String iso2Code, Pageable pageable);
}
