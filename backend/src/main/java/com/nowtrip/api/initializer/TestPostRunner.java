package com.nowtrip.api.initializer;

import com.nowtrip.api.service.post.PostService;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

@RequiredArgsConstructor
@Component
public class TestPostRunner implements CommandLineRunner {
    private final PostService postService;
    @Override
    public void run(String... args) throws Exception {
    }
}
