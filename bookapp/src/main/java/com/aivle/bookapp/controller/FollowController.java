package com.aivle.bookapp.controller;

import com.aivle.bookapp.dto.AuthResponse;
import com.aivle.bookapp.service.FollowService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/follow")
@RequiredArgsConstructor
public class FollowController {

    private final FollowService followService;

    // 팔로우 토글 (팔로우/언팔로우)
    @PostMapping("/toggle")
    public ResponseEntity<Map<String, Object>> toggleFollow(
            @RequestParam Long followerId,
            @RequestParam Long followingId
    ) {
        return ResponseEntity.ok(followService.toggleFollow(followerId, followingId));
    }

    // 팔로우 여부 확인
    @GetMapping("/check")
    public ResponseEntity<Map<String, Object>> checkFollow(
            @RequestParam Long followerId,
            @RequestParam Long followingId
    ) {
        boolean following = followService.isFollowing(followerId, followingId);
        return ResponseEntity.ok(Map.of("following", following));
    }

    // 팔로워/팔로잉 수 조회
    @GetMapping("/counts/{userId}")
    public ResponseEntity<Map<String, Long>> getCounts(@PathVariable Long userId) {
        return ResponseEntity.ok(Map.of(
                "followerCount", followService.getFollowerCount(userId),
                "followingCount", followService.getFollowingCount(userId)
        ));
    }

    // 내가 팔로우하는 유저 목록
    @GetMapping("/following/{followerId}")
    public ResponseEntity<List<AuthResponse>> getFollowingUsers(@PathVariable Long followerId) {
        return ResponseEntity.ok(followService.getFollowingUsers(followerId));
    }
}
