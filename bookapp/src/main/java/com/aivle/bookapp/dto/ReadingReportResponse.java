package com.aivle.bookapp.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

import java.util.List;

@Getter
@AllArgsConstructor
public class ReadingReportResponse {
    private Long userId;
    private String readerType;
    private String readerTypeDescription;
    private String summary;
    private String analysisStatus;
    private int totalBooks;
    private int finishedBooks;
    private int readingBooks;
    private int reviewCount;
    private int highlightCount;
    private double averageRating;
    private double completionRate;
    private int dataQuality;
    private List<ScoreItem> scores;
    private List<DistributionItem> genreDistribution;
    private List<DistributionItem> moodDistribution;
    private List<DistributionItem> statusDistribution;
    private List<String> insights;
    private List<String> warnings;

    @Getter
    @AllArgsConstructor
    public static class ScoreItem {
        private String key;
        private String label;
        private int value;
        private String description;
    }

    @Getter
    @AllArgsConstructor
    public static class DistributionItem {
        private String label;
        private long count;
        private double percentage;
    }
}
