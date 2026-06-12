package com.aivle.bookapp.repository;

import com.aivle.bookapp.entity.Book;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface BookRepository extends JpaRepository<Book, Long> {

    // 일반 목록 (휴지통 제외)
    List<Book> findByDeletedAtIsNull();

    // 휴지통 목록
    List<Book> findByDeletedAtIsNotNull();

    // 특정 사용자의 도서 목록 (휴지통 제외)
    List<Book> findByUserIdAndDeletedAtIsNull(Long userId);

    // 특정 사용자의 도서 전체 삭제 (회원 탈퇴 시)
    void deleteByUserId(Long userId);

    // 키워드 검색 (휴지통 제외)
    List<Book> findByDeletedAtIsNullAndTitleContainingIgnoreCaseOrDeletedAtIsNullAndAuthorContainingIgnoreCaseOrDeletedAtIsNullAndGenreContainingIgnoreCaseOrDeletedAtIsNullAndPublisherContainingIgnoreCase(
            String title,
            String author,
            String genre,
            String publisher
    );
}
