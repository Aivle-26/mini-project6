package com.aivle.bookapp.service;

import com.aivle.bookapp.entity.Highlight;
import com.aivle.bookapp.repository.HighlightRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class HighlightService {

    private final HighlightRepository highlightRepository;

    @Transactional(readOnly = true)
    public List<Highlight> getByBookId(Long bookId) {
        return highlightRepository.findByBookIdOrderByIdDesc(bookId);
    }

    @Transactional
    public Highlight create(Highlight highlight) {
        highlight.setCreatedAt(LocalDateTime.now());
        return highlightRepository.save(highlight);
    }

    @Transactional
    public void delete(Long id) {
        highlightRepository.deleteById(id);
    }
}
