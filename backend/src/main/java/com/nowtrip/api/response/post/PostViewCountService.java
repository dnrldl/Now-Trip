package com.nowtrip.api.response.post;

import com.nowtrip.api.repository.PostRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.util.Set;

@Service
@RequiredArgsConstructor
@Slf4j
public class PostViewCountService {
    private final RedisTemplate<String, String> redisTemplate;
    private final PostRepository postRepository;

    public void increaseViewCount(Long postId, String userIp) {
        String key = "viewed_post:" + postId + ":" + userIp; // 특정 게시글 + 특정 IP
        Boolean isViewed = redisTemplate.hasKey(key);

        if (Boolean.FALSE.equals(isViewed)) {
            redisTemplate.opsForValue().set(key, "true", Duration.ofMinutes(30)); // 30분 동안 유지
            redisTemplate.opsForValue().increment("post:view:" + postId, 1); // 조회수 증가
        }
    }

    /**
     * 일정 시간마다 Redis에 저장된 조회수를 DB에 동기화
     * TODO 한 게시글에 쿼리, 로그 한 줄씩 출력되는 문제 최적화
     */
    @Scheduled(fixedRate = 1000 * 60) // 1분마다 실행
    @Transactional
    public void syncViewCountsToDatabase() {
        Set<String> keys = redisTemplate.keys("post:view:*"); // "post:view:"로 시작하는 모든 키 가져오기

        if (keys != null) {
            for (String key : keys) {
                Long postId = Long.parseLong(key.split(":")[2]); // post:view:123 -> 123 추출
                Integer views = Integer.parseInt(redisTemplate.opsForValue().get(key));

                // DB에 조회수 업데이트
                postRepository.updateViewCount(postId, views);
                log.info("게시글 {} 조회수 {}개 동기화 완료", postId, views);

                // Redis에서 해당 조회수 삭제
                redisTemplate.delete(key);
            }
        }
    }
}
