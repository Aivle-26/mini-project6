package com.aivle.bookapp.repository;

import com.aivle.bookapp.entity.Review;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface ReviewRepository extends JpaRepository<Review, Long> {
    List<Review> findByBookId(Long bookId);
    List<Review> findByUserId(Long userId);

    void deleteByBookId(Long bookId);
    void deleteByUserId(Long userId);

    // 도서별 리뷰 수 집계 (검색 중복 제거 시 N+1 방지)
    @Query("SELECT r.bookId, COUNT(r) FROM Review r GROUP BY r.bookId")
    List<Object[]> countGroupedByBookId();
}