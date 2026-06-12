package com.aivle.bookapp.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "users")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String email;

    @Column(nullable = false)
    private String password;

    @Column(nullable = false, unique = true)
    private String username;

    @Column(nullable = false, unique = true)
    private String nickname;

    @Lob
    @Column(columnDefinition = "CLOB")
    private String profileImage;

    @Column(length = 1000)
    private String bio;

    // 서재 공개 여부 (null → 공개로 취급)
    @Builder.Default
    private Boolean libraryPublic = true;
}