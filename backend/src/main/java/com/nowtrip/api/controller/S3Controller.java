package com.nowtrip.api.controller;

import com.nowtrip.api.service.s3.S3Service;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/s3")
@RequiredArgsConstructor
public class S3Controller {

    private final S3Service s3Service;

    @PostMapping("/presigned-url")
    public ResponseEntity<Map<String, String>> getPresignedUrl(@RequestBody Map<String, String> request) {
        Map<String, String> response = s3Service.generatePresignedUrl(request.get("fileName"));
        return ResponseEntity.ok(response);
    }
}
