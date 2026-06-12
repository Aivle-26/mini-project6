package com.aivle.bookapp.service;

import com.aivle.bookapp.entity.Book;
import com.aivle.bookapp.repository.BookRepository;
import com.aivle.bookapp.repository.ReviewRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class BookSearchService {

    private final BookRepository bookRepository;
    private final ReviewRepository reviewRepository;

    public List<Book> searchBooks(String keyword) {

        List<Book> books = bookRepository
                .findByDeletedAtIsNullAndTitleContainingIgnoreCaseOrDeletedAtIsNullAndAuthorContainingIgnoreCaseOrDeletedAtIsNullAndGenreContainingIgnoreCaseOrDeletedAtIsNullAndPublisherContainingIgnoreCase(
                        keyword, keyword, keyword, keyword
                );

        // 도서별 리뷰 수를 한 번의 집계 쿼리로 미리 로드 (N+1 방지)
        Map<Long, Long> reviewCountMap = new HashMap<>();
        for (Object[] row : reviewRepository.countGroupedByBookId()) {
            reviewCountMap.put((Long) row[0], (Long) row[1]);
        }

        LinkedHashMap<String, Book> uniqueBooks = new LinkedHashMap<>();

        for (Book book : books) {
            String key;

            if (book.getIsbn() != null && !book.getIsbn().isBlank()) {
                key = book.getIsbn();
            } else {
                key = book.getTitle() + "_" + book.getAuthor();
            }

            uniqueBooks.merge(key, book, (existing, current) -> {
                long existingReviewCount = reviewCountMap.getOrDefault(existing.getId(), 0L);
                long currentReviewCount = reviewCountMap.getOrDefault(current.getId(), 0L);

                if (currentReviewCount != existingReviewCount) {
                    return currentReviewCount > existingReviewCount ? current : existing;
                }

                int existingLikes = existing.getLikes() == null ? 0 : existing.getLikes();
                int currentLikes = current.getLikes() == null ? 0 : current.getLikes();

                if (currentLikes != existingLikes) {
                    return currentLikes > existingLikes ? current : existing;
                }

                return existing;
            });
        }

        return new ArrayList<>(uniqueBooks.values());
    }
}
