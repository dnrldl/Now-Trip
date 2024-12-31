package com.nowtrip.api.repository;

import com.nowtrip.api.entity.Post;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface PostRepository extends JpaRepository<Post, Long> {
    List<Post> findByCountryIso3Code(String iso3Code);
}
