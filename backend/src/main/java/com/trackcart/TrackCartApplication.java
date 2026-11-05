package com.trackcart;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class TrackCartApplication {

    public static void main(String[] args) {
        SpringApplication.run(TrackCartApplication.class, args);
    }
}
