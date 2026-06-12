package com.aivle.bookapp.repository;

import com.aivle.bookapp.entity.Bookshelf;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface BookshelfRepository extends JpaRepository<Bookshelf, Long> {
    List<Bookshelf> findByUserIdAndDeletedAtIsNull(Long userId);

    void deleteByUserId(Long userId);
}
