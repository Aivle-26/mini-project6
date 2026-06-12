package com.aivle.bookapp.controller;

import com.aivle.bookapp.dto.FeedResponse;
import com.aivle.bookapp.entity.Feed;
import com.aivle.bookapp.entity.FeedComment;
import com.aivle.bookapp.service.FeedService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/feeds")
@RequiredArgsConstructor
public class FeedController {

    private final FeedService feedService;

    // 피드 전체 조회
    @GetMapping
    public ResponseEntity<List<Feed>> getAllFeeds() {
        return ResponseEntity.ok(feedService.findAll());
    }

    // 팔로잉 피드 조회
    @GetMapping("/following")
    public ResponseEntity<List<FeedResponse>> getFollowingFeed(@RequestParam Long userId) {
        return ResponseEntity.ok(feedService.getFollowingFeed(userId));
    }

    // 피드 좋아요 토글
    @PostMapping("/{feedId}/likes")
    public ResponseEntity<Void> toggleLike(
            @PathVariable Long feedId,
            @RequestParam Long userId
    ) {
        feedService.toggleLike(feedId, userId);
        return ResponseEntity.ok().build();
    }

    // 피드 댓글 등록
    @PostMapping("/{feedId}/comments")
    public ResponseEntity<FeedComment> addComment(
            @PathVariable Long feedId,
            @Valid @RequestBody FeedComment comment
    ) {
        FeedComment saved = feedService.addComment(
                feedId,
                comment.getUserId(),
                comment.getUsername(),
                comment.getContent()
        );
        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }

    // 피드 댓글 조회
    @GetMapping("/{feedId}/comments")
    public ResponseEntity<List<FeedComment>> getComments(@PathVariable Long feedId) {
        return ResponseEntity.ok(feedService.getComments(feedId));
    }

    // 피드 댓글 삭제
    @DeleteMapping("/comments/{commentId}")
    public ResponseEntity<Void> deleteComment(@PathVariable Long commentId) {
        feedService.deleteComment(commentId);
        return ResponseEntity.noContent().build();
    }
}
