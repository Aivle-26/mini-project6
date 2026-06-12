package com.aivle.bookapp.dto;

import com.aivle.bookapp.entity.Book;
import lombok.AllArgsConstructor;
import lombok.Getter;

import java.util.List;

@Getter
@AllArgsConstructor
public class SearchResponse {
    private List<Book> books;
    private List<AuthResponse> users;
}
