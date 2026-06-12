package com.aivle.bookapp.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Highlight {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long bookId;

    private Long userId;

    @Column(columnDefinition = "TEXT")
    private String quote;

    @Column(columnDefinition = "TEXT")
    private String note;

    private String page;

    @Builder.Default
    private Boolean isSpoiler = false;

    private LocalDateTime createdAt;
}
