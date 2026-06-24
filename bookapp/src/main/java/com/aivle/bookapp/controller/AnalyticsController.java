package com.aivle.bookapp.controller;

import com.aivle.bookapp.dto.ReadingReportResponse;
import com.aivle.bookapp.service.AnalyticsService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
@RequestMapping("/analytics")
public class AnalyticsController {

    private final AnalyticsService analyticsService;

    @GetMapping("/users/{userId}/reading-report")
    public ReadingReportResponse getReadingReport(
            @PathVariable Long userId,
            @RequestParam Long requesterId
    ) {
        return analyticsService.getReadingReport(userId, requesterId);
    }
}
