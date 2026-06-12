package com.aivle.bookapp.service;

import com.aivle.bookapp.dto.AuthResponse;
import com.aivle.bookapp.entity.Follow;
import com.aivle.bookapp.repository.FollowRepository;
import com.aivle.bookapp.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Transactional
public class FollowService {

    private final FollowRepository followRepository;
    private final UserRepository userRepository;

    public Map<String, Object> toggleFollow(Long followerId, Long followingId) {
        if (followerId.equals(followingId)) {
            throw new IllegalArgumentException("자기 자신을 팔로우할 수 없습니다.");
        }

        Optional<Follow> existing = followRepository.findByFollowerIdAndFollowingId(followerId, followingId);

        if (existing.isPresent()) {
            followRepository.delete(existing.get());
            return Map.of("following", false);
        }

        Follow follow = new Follow();
        follow.setFollowerId(followerId);
        follow.setFollowingId(followingId);
        follow.setCreatedDate(LocalDateTime.now());
        followRepository.save(follow);
        return Map.of("following", true);
    }

    @Transactional(readOnly = true)
    public boolean isFollowing(Long followerId, Long followingId) {
        return followRepository.findByFollowerIdAndFollowingId(followerId, followingId).isPresent();
    }

    @Transactional(readOnly = true)
    public long getFollowerCount(Long userId) {
        return followRepository.countByFollowingId(userId);
    }

    @Transactional(readOnly = true)
    public long getFollowingCount(Long userId) {
        return followRepository.countByFollowerId(userId);
    }

    @Transactional(readOnly = true)
    public List<AuthResponse> getFollowingUsers(Long followerId) {
        List<Long> ids = followRepository.findByFollowerId(followerId)
                .stream().map(Follow::getFollowingId).toList();
        return userRepository.findAllById(ids)
                .stream().map(AuthResponse::new).toList();
    }
}
