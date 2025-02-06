package com.nowtrip.api.service.s3;

import com.amazonaws.HttpMethod;
import com.amazonaws.services.s3.AmazonS3;
import com.amazonaws.services.s3.model.GeneratePresignedUrlRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.net.URL;
import java.util.*;


@Service
@RequiredArgsConstructor
public class S3Service {

    private final AmazonS3 amazonS3;

    @Value("${cloud.aws.s3.bucket}")
    private String bucketName;

    @Value("${cloudfront.domain}")
    private String cloudFrontDomain;

    public List<Map<String, String>> generatePresignedUrl(List<String> originalFileNames) {
        List<Map<String, String>> result = new ArrayList<>();

        for (String originalFileName : originalFileNames) {
            String fileExtension = originalFileName.substring(originalFileName.lastIndexOf("."));
            String newFileName = UUID.randomUUID() + fileExtension;
            String contentType = getContentType(fileExtension);

            // 만료 시간 설정 (5분)
            Date expiration = new Date(System.currentTimeMillis() + 1000 * 60 * 5);

            // 요청 생성
            GeneratePresignedUrlRequest generatePresignedUrlRequest =
                    new GeneratePresignedUrlRequest(bucketName, "uploads/" + newFileName) // 경로(파일이름)
                            .withMethod(HttpMethod.PUT)
                            .withContentType(contentType)
                            .withExpiration(expiration);

            // URL 생성
            URL presignedUrl = amazonS3.generatePresignedUrl(generatePresignedUrlRequest);

            Map<String, String> fileData = new HashMap<>();

            fileData.put("presignedUrl", presignedUrl.toString());
            fileData.put("fileUrl", cloudFrontDomain + "/uploads/" + newFileName);

            result.add(fileData);
        }

        return result;
    }

    private String getContentType(String fileExtension) {
        return switch (fileExtension.toLowerCase()) {
            case ".jpg", ".jpeg" -> "image/jpeg";
            case ".png" -> "image/png";
            case ".gif" -> "image/gif";
            case ".svg" -> "image/svg+xml";
            default -> "application/octet-stream"; // 기본값
        };
    }
}
