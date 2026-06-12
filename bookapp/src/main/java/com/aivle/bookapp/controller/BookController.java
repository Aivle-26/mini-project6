package com.aivle.bookapp.controller;

import com.aivle.bookapp.dto.RecommendResponse;
import com.aivle.bookapp.entity.Book;
import com.aivle.bookapp.service.BookService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/books")
@RequiredArgsConstructor
public class BookController {

    private final BookService bookService;

    // 전체 조회 (휴지통 제외)
    @GetMapping
    public ResponseEntity<List<Book>> getAllBooks() {
        return ResponseEntity.ok(bookService.getAllBooks());
    }

    // 세부 조회
    @GetMapping("/{id}")
    public ResponseEntity<Book> getBookById(@PathVariable Long id) {
        return ResponseEntity.ok(bookService.getBookById(id));
    }

    // 도서 등록
    @PostMapping
    public ResponseEntity<Book> createBook(@Valid @RequestBody Book book) {
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(bookService.createBook(book));
    }

    // 도서 전체 수정
    @PutMapping("/{id}")
    public ResponseEntity<Book> updateBook(
            @PathVariable Long id,
            @Valid @RequestBody Book bookDetails
    ) {
        return ResponseEntity.ok(bookService.updateBook(id, bookDetails));
    }

    // 도서 부분 수정
    @PatchMapping("/{id}")
    public ResponseEntity<Book> updateBookPartial(
            @PathVariable Long id,
            @RequestBody Map<String, Object> updates
    ) {
        return ResponseEntity.ok(bookService.updateBookPartial(id, updates));
    }

    // 도서 삭제 → 휴지통 이동
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteBook(@PathVariable Long id) {
        bookService.deleteBook(id);
        return ResponseEntity.noContent().build();
    }

    // 휴지통 조회
    @GetMapping("/trash")
    public ResponseEntity<List<Book>> getTrashBooks() {
        return ResponseEntity.ok(bookService.getTrashBooks());
    }

    // 휴지통 복구
    @PatchMapping("/{id}/restore")
    public ResponseEntity<Void> restoreBook(@PathVariable Long id) {
        bookService.restoreBook(id);
        return ResponseEntity.noContent().build();
    }

    // 영구 삭제
    @DeleteMapping("/{id}/permanent")
    public ResponseEntity<Void> permanentlyDeleteBook(@PathVariable Long id) {
        bookService.permanentlyDeleteBook(id);
        return ResponseEntity.noContent().build();
    }

    // 내 서재 도서 목록
    @GetMapping("/my")
    public ResponseEntity<List<Book>> getMyBooks(@RequestParam Long userId) {
        return ResponseEntity.ok(bookService.getMyBooks(userId));
    }

    // 독서 상태 변경
    @PatchMapping("/{id}/status")
    public ResponseEntity<Book> updateReadingStatus(
            @PathVariable Long id,
            @RequestBody Map<String, Object> body
    ) {
        String status = (String) body.get("readingStatus");
        return ResponseEntity.ok(bookService.updateReadingStatus(id, status));
    }

    // 책장 배정
    @PatchMapping("/{id}/shelf")
    public ResponseEntity<Book> assignToShelf(
            @PathVariable Long id,
            @RequestBody Map<String, Object> body
    ) {
        Object val = body.get("bookshelfId");
        Long bookshelfId = val != null ? Long.valueOf(val.toString()) : null;
        return ResponseEntity.ok(bookService.assignToShelf(id, bookshelfId));
    }

    // AI 표지 저장
    @PatchMapping("/{id}/cover")
    public ResponseEntity<Book> updateBookCover(
            @PathVariable Long id,
            @RequestBody Map<String, Object> body
    ) {
        String posterUrl = (String) body.get("posterUrl");
        return ResponseEntity.ok(bookService.updateBookCover(id, posterUrl));
    }

    // 타인 서재 도서 조회
    @GetMapping("/user/{userId}")
    public ResponseEntity<List<Book>> getUserBooks(@PathVariable Long userId) {
        return ResponseEntity.ok(bookService.getUserBooks(userId));
    }

    // 맞춤 추천
    @GetMapping("/recommend")
    public ResponseEntity<RecommendResponse> getRecommendedBooks(@RequestParam Long userId) {
        return ResponseEntity.ok(bookService.getRecommendedBooks(userId));
    }

    // 랜덤 도서 조회
    @GetMapping("/random")
    public ResponseEntity<List<Book>> getRandomBooks(
            @RequestParam(defaultValue = "20") int count
    ) {
        return ResponseEntity.ok(bookService.getRandomBooks(count));
    }

    // 내 서재에 추가
    @PostMapping("/{id}/my")
    public ResponseEntity<Book> addToLibrary(
            @PathVariable Long id,
            @RequestParam Long userId
    ) {
        return ResponseEntity.ok(bookService.addToLibrary(id, userId));
    }

    // 책 좋아요 토글
    @PostMapping("/{id}/likes")
    public ResponseEntity<Void> toggleLike(
            @PathVariable Long id,
            @RequestParam Long userId
    ) {
        bookService.toggleLike(id, userId);
        return ResponseEntity.ok().build();
    }
}
