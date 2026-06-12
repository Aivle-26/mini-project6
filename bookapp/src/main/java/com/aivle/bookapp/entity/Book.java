package com.aivle.bookapp.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import lombok.*;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Book {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "제목은 필수입니다.")
    @Column(nullable = false, length = 200)
    private String title;

    @NotBlank(message = "저자는 필수입니다.")
    @Column(length = 100)
    private String author;

    @Column(length = 5000)
    private String description;

    @Column(length = 100)
    private String isbn;

    private String genre;

    @Lob
    @Column(columnDefinition = "CLOB")
    private String poster;

    private String publisher;

    private String publishedDate;

    private Integer pageCount;

    private Long userId;

    private String readingStatus;

    private Long bookshelfId;

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "book_moods", joinColumns = @JoinColumn(name = "book_id"))
    @Column(name = "mood")
    @Builder.Default
    private List<String> moods = new ArrayList<>();

    private Long representativeCoverId;

    @Builder.Default
    private Integer likes = 0;

    @Builder.Default
    private Boolean isFavorite = false;

    private String createdDate;

    private String modifiedDate;

    private LocalDateTime deletedAt;
}
