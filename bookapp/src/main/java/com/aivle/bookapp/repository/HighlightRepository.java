package com.aivle.bookapp.repository;

import com.aivle.bookapp.entity.Highlight;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface HighlightRepository extends JpaRepository<Highlight, Long> {
    List<Highlight> findByBookIdOrderByIdDesc(Long bookId);

    void deleteByBookId(Long bookId);

    void deleteByUserId(Long userId);
}
