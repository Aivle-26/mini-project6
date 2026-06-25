package com.aivle.bookapp.service;

import com.aivle.bookapp.entity.Highlight;
import com.aivle.bookapp.exception.ActionAccessDeniedException;
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

    private void assertHighlightOwner(Highlight highlight, Long requesterId) {
        if (requesterId != null && !requesterId.equals(highlight.getUserId())) {
            throw new ActionAccessDeniedException("본인이 작성한 명대사만 삭제할 수 있습니다.");
        }
    }

    @Transactional(readOnly = true)
    public List<Highlight> getByBookId(Long bookId) {
        return highlightRepository.findByBookIdOrderByIdDesc(bookId);
    }

    @Transactional(readOnly = true)
    public List<Highlight> getByUserId(Long userId) {
        return highlightRepository.findByUserIdOrderByIdDesc(userId);
    }

    @Transactional
    public Highlight create(Highlight highlight) {
        highlight.setCreatedAt(LocalDateTime.now());
        return highlightRepository.save(highlight);
    }

    @Transactional
    public void delete(Long id) {
        delete(id, null);
    }

    @Transactional
    public void delete(Long id, Long requesterId) {
        Highlight highlight = highlightRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("명대사를 찾을 수 없습니다."));
        assertHighlightOwner(highlight, requesterId);
        highlightRepository.delete(highlight);
    }
}
