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
    public ResponseEntity<List<Highlight>> getByBookId(@RequestParam Long bookId) {
        return ResponseEntity.ok(highlightService.getByBookId(bookId));
    }

    @PostMapping
    public ResponseEntity<Highlight> create(@RequestBody Highlight highlight) {
        return ResponseEntity.status(HttpStatus.CREATED).body(highlightService.create(highlight));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        highlightService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
