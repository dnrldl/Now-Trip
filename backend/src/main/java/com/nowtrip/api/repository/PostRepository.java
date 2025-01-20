package com.nowtrip.api.repository;

import com.nowtrip.api.entity.Post;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface PostRepository extends JpaRepository<Post, Long> {
    List<Post> findByCountryIso3Code(String iso3Code);
    @Query("SELECT p FROM Post p ORDER BY p.createdAt DESC")
    Page<Post> findAllWithoutComments(Pageable pageable);

    @Query("SELECT p FROM Post p WHERE p.createdBy = :email ORDER BY p.createdAt DESC")
    Page<Post> findAllWithoutCommentsByEmail(@Param("email") String email, Pageable pageable);
}
