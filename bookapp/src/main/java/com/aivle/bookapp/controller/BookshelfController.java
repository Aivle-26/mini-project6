package com.aivle.bookapp.controller;

import com.aivle.bookapp.entity.Bookshelf;
import com.aivle.bookapp.service.BookshelfService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/bookshelves")
@RequiredArgsConstructor
public class BookshelfController {

    private final BookshelfService bookshelfService;

    // 책장 생성
    @PostMapping
    public ResponseEntity<Bookshelf> create(@RequestBody Map<String, Object> body) {
        Long userId = Long.valueOf(body.get("userId").toString());
        String name = (String) body.get("name");
        return ResponseEntity.ok(bookshelfService.createBookshelf(userId, name));
    }

    // 내 책장 목록
    @GetMapping
    public ResponseEntity<List<Bookshelf>> getMine(@RequestParam Long userId) {
        return ResponseEntity.ok(bookshelfService.getMyBookshelves(userId));
    }

    // 책장 삭제 (소프트)
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        bookshelfService.deleteBookshelf(id);
        return ResponseEntity.ok().build();
    }
}
