package com.nowtrip.api.controller;

import com.nowtrip.api.response.ppp.PppResponse;
import com.nowtrip.api.service.ppp.PppDataService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/ppp")
public class PppDataController {
    private final PppDataService pppDataService;

    @PostMapping
    public ResponseEntity<String> savePppData() {
        pppDataService.saveAllPppData();
        return ResponseEntity.ok("ok");
    }


    @GetMapping("{iso3code}")
    public ResponseEntity<List<PppResponse>> getPppData(@PathVariable String iso3code) {
        List<PppResponse> pppDataByCountry = pppDataService.getPppDataByCountry(iso3code);
        return ResponseEntity.ok(pppDataByCountry);
    }

}
