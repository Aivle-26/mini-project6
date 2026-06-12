package com.aivle.bookapp.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Review {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // 프론트엔드 페이로드와 타입/이름 일치
    private Long bookId;

    private Long userId;

    private String writer;

    @Column(columnDefinition = "TEXT")
    private String content;

    private Integer rating;

    // 프론트에서 주는 문자열 그대로 받기
    private String createdAt;
}