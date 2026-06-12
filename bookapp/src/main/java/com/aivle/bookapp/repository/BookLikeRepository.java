package com.aivle.bookapp.repository;

import com.aivle.bookapp.entity.BookLike;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface BookLikeRepository extends JpaRepository<BookLike, Long> {
    Optional<BookLike> findByBookIdAndUserId(Long bookId, Long userId);

    void deleteByBookId(Long bookId);

    void deleteByUserId(Long userId);
}
