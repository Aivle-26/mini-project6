package com.aivle.bookapp.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FeedComment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long feedId;

    private Long userId;

    @NotBlank
    private String username;

    @NotBlank
    @Size(max = 1000)
    private String content;

    private LocalDateTime createdAt;
}
