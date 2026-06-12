package com.aivle.bookapp.controller;

import com.aivle.bookapp.dto.SearchResponse;
import com.aivle.bookapp.service.BookSearchService;
import com.aivle.bookapp.service.UserSearchService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/search")
@RequiredArgsConstructor
public class SearchController {

    private final BookSearchService bookSearchService;
    private final UserSearchService userSearchService;

    @GetMapping
    public ResponseEntity<SearchResponse> search(@RequestParam String keyword) {
        return ResponseEntity.ok(
                new SearchResponse(
                        bookSearchService.searchBooks(keyword),
                        userSearchService.searchUsers(keyword)
                )
        );
    }
}
