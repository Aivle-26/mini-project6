package com.aivle.bookapp.controller;

import com.aivle.bookapp.entity.Highlight;
import com.aivle.bookapp.service.HighlightService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/highlights")
@RequiredArgsConstructor
public class HighlightController {

    private final HighlightService highlightService;

    @GetMapping
    public ResponseEntity<List<Highlight>> getHighlights(
            @RequestParam(required = false) Long bookId,
            @RequestParam(required = false) Long userId
    ) {
        if (userId != null) {
            return ResponseEntity.ok(highlightService.getByUserId(userId));
        }
        if (bookId == null) {
            return ResponseEntity.badRequest().build();
        }
        return ResponseEntity.ok(highlightService.getByBookId(bookId));
    }

    @PostMapping
    public ResponseEntity<Highlight> create(@RequestBody Highlight highlight) {
        return ResponseEntity.status(HttpStatus.CREATED).body(highlightService.create(highlight));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(
            @PathVariable Long id,
            @RequestParam(required = false) Long requesterId
    ) {
        highlightService.delete(id, requesterId);
        return ResponseEntity.noContent().build();
    }
}
