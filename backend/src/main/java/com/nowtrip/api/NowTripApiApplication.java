package com.nowtrip.api;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;

@SpringBootApplication
public class NowTripApiApplication {

    public static void main(String[] args) {
        SpringApplication.run(NowTripApiApplication.class, args);
    }

}
