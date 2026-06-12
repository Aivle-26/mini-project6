package com.aivle.bookapp.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@AllArgsConstructor
public class FeedResponse {

    private Long id;
    private String action;
    private LocalDateTime createdAt;
    private Integer likeCount;
    private Integer commentCount;
    private UserInfo user;
    private BookInfo book;

    @Getter
    @AllArgsConstructor
    public static class UserInfo {
        private Long id;
        private String username;
        private String nickname;
        private String profileImage;
    }

    @Getter
    @AllArgsConstructor
    public static class BookInfo {
        private Long id;
        private String title;
        private String author;
        private String poster;
    }
}
