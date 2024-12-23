package com.nowtrip.api.controller;

import com.nowtrip.api.service.ppp.PppDataService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/ppp")
public class PppDataController {
    private final PppDataService pppDataService;

    @PostMapping("/{countryCode}")
    public ResponseEntity<String> fetchAndSavePppData(@PathVariable String countryCode) {
        try {
            pppDataService.savePppData(countryCode);
            return ResponseEntity.ok("PPP 데이터 저장 완료");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("오류 발생: " + e.getMessage());
        }
    }

}
