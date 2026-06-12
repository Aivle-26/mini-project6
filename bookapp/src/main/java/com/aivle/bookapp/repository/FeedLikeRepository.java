package com.aivle.bookapp.repository;

import com.aivle.bookapp.entity.FeedLike;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface FeedLikeRepository extends JpaRepository<FeedLike, Long> {
    Optional<FeedLike> findByFeedIdAndUserId(Long feedId, Long userId);

    void deleteByUserId(Long userId);
}
