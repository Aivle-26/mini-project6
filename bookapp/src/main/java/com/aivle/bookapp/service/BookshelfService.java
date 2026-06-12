package com.aivle.bookapp.service;

import com.aivle.bookapp.entity.Bookshelf;
import com.aivle.bookapp.repository.BookshelfRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class BookshelfService {

    private final BookshelfRepository bookshelfRepository;

    public Bookshelf createBookshelf(Long userId, String name) {
        Bookshelf shelf = Bookshelf.builder()
                .userId(userId)
                .name(name)
                .createdAt(LocalDateTime.now())
                .build();
        return bookshelfRepository.save(shelf);
    }

    @Transactional(readOnly = true)
    public List<Bookshelf> getMyBookshelves(Long userId) {
        return bookshelfRepository.findByUserIdAndDeletedAtIsNull(userId);
    }

    public void deleteBookshelf(Long id) {
        Bookshelf shelf = bookshelfRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("책장을 찾을 수 없습니다."));
        shelf.setDeletedAt(LocalDateTime.now());
    }
}
