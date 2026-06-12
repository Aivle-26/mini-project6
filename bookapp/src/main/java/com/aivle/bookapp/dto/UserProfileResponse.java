package com.aivle.bookapp.dto;

import com.aivle.bookapp.entity.User;
import lombok.Getter;

@Getter
public class UserProfileResponse {

    private final Long id;
    private final String email;
    private final String username;
    private final String nickname;
    private final String bio;
    private final String profileImage;
    private final long followerCount;
    private final long followingCount;

    public UserProfileResponse(User user, long followerCount, long followingCount) {
        this.id = user.getId();
        this.email = user.getEmail();
        this.username = user.getUsername();
        this.nickname = user.getNickname();
        this.bio = user.getBio();
        this.profileImage = user.getProfileImage();
        this.followerCount = followerCount;
        this.followingCount = followingCount;
    }
}
