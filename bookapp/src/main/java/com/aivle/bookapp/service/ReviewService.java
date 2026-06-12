package com.aivle.bookapp.service;

import com.aivle.bookapp.entity.Review;
import com.aivle.bookapp.exception.ReviewNotFoundException;
import com.aivle.bookapp.repository.ReviewRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ReviewService {

    private final ReviewRepository reviewRepository;
    private final FeedService feedService;

    // 전체 리뷰 조회
    @Transactional(readOnly = true)
    public List<Review> getAllReviews() {
        return reviewRepository.findAll();
    }

    // 특정 도서의 리뷰 목록 조회
    @Transactional(readOnly = true)
    public List<Review> getReviewsByBookId(Long bookId) {
        return reviewRepository.findByBookId(bookId);
    }

    // 사용자별 리뷰 목록 조회
    @Transactional(readOnly = true)
    public List<Review> getReviewsByUserId(Long userId) {
        return reviewRepository.findByUserId(userId);
    }

    // 리뷰 등록
    @Transactional
    public Review createReview(Review review) {
        Review saved = reviewRepository.save(review);
        if (review.getUserId() != null && review.getBookId() != null) {
            feedService.createFeed(review.getUserId(), review.getBookId(), "review");
        }
        return saved;
    }

    // 리뷰 수정
    @Transactional
    public Review updateReview(Long id, Review review) {
        Review existing = reviewRepository.findById(id)
                .orElseThrow(() -> new ReviewNotFoundException(id));

        if (review.getContent() != null) {
            existing.setContent(review.getContent());
        }

        if (review.getWriter() != null) {
            existing.setWriter(review.getWriter());
        }

        if (review.getRating() != null) {
            existing.setRating(review.getRating());
        }

        return existing;
    }

    // 리뷰 삭제
    @Transactional
    public void deleteReview(Long id) {
        if (reviewRepository.existsById(id)) {
            reviewRepository.deleteById(id);
        } else {
            throw new ReviewNotFoundException(id);
        }
    }
}
