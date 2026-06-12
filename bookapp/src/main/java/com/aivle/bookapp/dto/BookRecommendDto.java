package com.aivle.bookapp.dto;

import com.aivle.bookapp.entity.Book;
import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class BookRecommendDto {
    private Book book;
    private int score;
    private String matchReason;
}
