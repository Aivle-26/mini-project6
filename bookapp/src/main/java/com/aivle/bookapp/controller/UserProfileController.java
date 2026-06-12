package com.aivle.bookapp.controller;

import com.aivle.bookapp.dto.AuthResponse;
import com.aivle.bookapp.dto.UpdateProfileRequest;
import com.aivle.bookapp.dto.UserProfileResponse;
import com.aivle.bookapp.entity.User;
import com.aivle.bookapp.service.FollowService;
import com.aivle.bookapp.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/users")
@RequiredArgsConstructor
public class UserProfileController {

    private final UserService userService;
    private final FollowService followService;

    // 유저 프로필 조회 (username으로)
    @GetMapping("/{username}")
    public ResponseEntity<UserProfileResponse> getProfile(@PathVariable String username) {
        User user = userService.getUserByUsername(username);
        long followerCount = followService.getFollowerCount(user.getId());
        long followingCount = followService.getFollowingCount(user.getId());
        return ResponseEntity.ok(new UserProfileResponse(user, followerCount, followingCount));
    }

    // 프로필 수정
    @PutMapping("/{id}")
    public ResponseEntity<AuthResponse> updateProfile(
            @PathVariable Long id,
            @RequestBody UpdateProfileRequest request
    ) {
        return ResponseEntity.ok(userService.updateProfile(id, request));
    }
}
