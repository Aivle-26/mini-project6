package com.aivle.bookapp.dto;

import com.aivle.bookapp.entity.User;
import lombok.Getter;

@Getter
public class AuthResponse {

    private final Long id;
    private final String email;
    private final String username;
    private final String nickname;
    private final String profileImage;
    private final String bio;
    private final boolean libraryPublic;

    public AuthResponse(User user) {
        this.id = user.getId();
        this.email = user.getEmail();
        this.username = user.getUsername();
        this.nickname = user.getNickname();
        this.profileImage = user.getProfileImage();
        this.bio = user.getBio();
        // null이면 공개(true)로 취급 — 기존 계정 하위호환
        this.libraryPublic = user.getLibraryPublic() == null || user.getLibraryPublic();
    }
}
