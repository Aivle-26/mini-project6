package com.aivle.bookapp.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

import java.util.List;

@Getter
@AllArgsConstructor
public class RecommendResponse {
    private List<String> topGenres;
    private List<String> topMoods;
    private List<BookRecommendDto> books;
    private int totalLibraryCount;
}
