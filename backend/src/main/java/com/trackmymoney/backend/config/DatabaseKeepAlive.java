package com.trackmymoney.backend.config;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Component
@EnableScheduling
public class DatabaseKeepAlive {

    private final JdbcTemplate jdbcTemplate;

    @Autowired
    public DatabaseKeepAlive(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    @Scheduled(fixedRate = 300000) // 5 minutes
    public void keepAlive() {
        jdbcTemplate.execute("SELECT 1");
    }
}
