package com.aivle.bookapp.service;

import com.aivle.bookapp.dto.FeedResponse;
import com.aivle.bookapp.entity.Feed;
import com.aivle.bookapp.entity.FeedComment;
import com.aivle.bookapp.entity.FeedLike;
import com.aivle.bookapp.exception.FeedNotFoundException;
import com.aivle.bookapp.repository.BookRepository;
import com.aivle.bookapp.repository.FeedCommentRepository;
import com.aivle.bookapp.repository.FeedLikeRepository;
import com.aivle.bookapp.repository.FeedRepository;
import com.aivle.bookapp.repository.FollowRepository;
import com.aivle.bookapp.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class FeedService {

    private final FeedRepository feedRepository;
    private final FeedLikeRepository feedLikeRepository;
    private final FeedCommentRepository feedCommentRepository;
    private final FollowRepository followRepository;
    private final UserRepository userRepository;
    private final BookRepository bookRepository;

    // 전체 피드 조회
    @Transactional(readOnly = true)
    public List<Feed> findAll() {
        return feedRepository.findAll();
    }

    // 피드 생성 (독서 상태 변경 시 호출)
    public void createFeed(Long userId, Long bookId, String action) {
        Feed feed = Feed.builder()
                .userId(userId)
                .bookId(bookId)
                .action(action)
                .createdAt(LocalDateTime.now())
                .build();
        feedRepository.save(feed);
    }

    // 팔로잉 피드 조회
    @Transactional(readOnly = true)
    public List<FeedResponse> getFollowingFeed(Long userId) {
        List<Long> followingIds = followRepository.findByFollowerId(userId)
                .stream().map(f -> f.getFollowingId()).toList();

        if (followingIds.isEmpty()) return List.of();

        List<Feed> feeds = feedRepository.findByUserIdInOrderByCreatedAtDesc(followingIds);

        Map<Long, com.aivle.bookapp.entity.User> userMap = userRepository.findAllById(followingIds)
                .stream().collect(Collectors.toMap(u -> u.getId(), u -> u));

        List<Long> bookIds = feeds.stream().map(Feed::getBookId).distinct().toList();
        Map<Long, com.aivle.bookapp.entity.Book> bookMap = bookRepository.findAllById(bookIds)
                .stream().collect(Collectors.toMap(b -> b.getId(), b -> b));

        return feeds.stream().map(feed -> {
            com.aivle.bookapp.entity.User u = userMap.get(feed.getUserId());
            com.aivle.bookapp.entity.Book b = bookMap.get(feed.getBookId());

            FeedResponse.UserInfo userInfo = u != null
                    ? new FeedResponse.UserInfo(u.getId(), u.getUsername(), u.getNickname(), u.getProfileImage())
                    : new FeedResponse.UserInfo(feed.getUserId(), "unknown", "알 수 없음", null);

            FeedResponse.BookInfo bookInfo = b != null
                    ? new FeedResponse.BookInfo(b.getId(), b.getTitle(), b.getAuthor(), b.getPoster())
                    : new FeedResponse.BookInfo(feed.getBookId(), "알 수 없는 책", null, null);

            return new FeedResponse(
                    feed.getId(), feed.getAction(), feed.getCreatedAt(),
                    feed.getLikeCount(), feed.getCommentCount(),
                    userInfo, bookInfo
            );
        }).toList();
    }

    // 피드 좋아요 토글
    @Transactional
    public void toggleLike(Long feedId, Long userId) {
        Feed feed = feedRepository.findById(feedId)
                .orElseThrow(() -> new FeedNotFoundException(feedId));

        Optional<FeedLike> existing = feedLikeRepository.findByFeedIdAndUserId(feedId, userId);

        if (existing.isPresent()) {
            feedLikeRepository.delete(existing.get());
            feed.setLikeCount(Math.max(0, feed.getLikeCount() - 1));
            return;
        }

        FeedLike newLike = new FeedLike();
        newLike.setFeedId(feedId);
        newLike.setUserId(userId);
        newLike.setCreatedDate(LocalDateTime.now());

        feedLikeRepository.save(newLike);
        feed.setLikeCount(feed.getLikeCount() + 1);
    }

    // 피드 댓글 조회
    @Transactional(readOnly = true)
    public List<FeedComment> getComments(Long feedId) {
        return feedCommentRepository.findByFeedIdOrderByCreatedAtAsc(feedId);
    }

    // 피드 댓글 등록
    @Transactional
    public FeedComment addComment(Long feedId, Long userId, String username, String content) {
        Feed feed = feedRepository.findById(feedId)
                .orElseThrow(() -> new FeedNotFoundException(feedId));

        FeedComment comment = FeedComment.builder()
                .feedId(feedId)
                .userId(userId)
                .username(username)
                .content(content)
                .createdAt(LocalDateTime.now())
                .build();

        FeedComment saved = feedCommentRepository.save(comment);
        feed.setCommentCount(feed.getCommentCount() + 1);
        return saved;
    }

    // 피드 댓글 삭제
    @Transactional
    public void deleteComment(Long commentId) {
        FeedComment comment = feedCommentRepository.findById(commentId)
                .orElseThrow(() -> new IllegalArgumentException("댓글을 찾을 수 없습니다."));

        Feed feed = feedRepository.findById(comment.getFeedId())
                .orElseThrow(() -> new FeedNotFoundException(comment.getFeedId()));

        feedCommentRepository.delete(comment);
        feed.setCommentCount(Math.max(0, feed.getCommentCount() - 1));
    }
}
