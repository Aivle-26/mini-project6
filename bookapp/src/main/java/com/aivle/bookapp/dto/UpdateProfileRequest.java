package com.aivle.bookapp.dto;

import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
public class UpdateProfileRequest {

    private String nickname;
    private String username;
    private String bio;
    private String profileImage;
}
