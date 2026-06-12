package com.aivle.bookapp.repository;

import com.aivle.bookapp.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {

    Optional<User> findByEmail(String email);

    Optional<User> findByUsername(String username);

    boolean existsByEmail(String email);

    boolean existsByUsername(String username);

    boolean existsByNickname(String nickname);

    List<User> findByNicknameContainingIgnoreCaseOrEmailContainingIgnoreCase(
            String nickname,
            String email
    );

    // 서재 공개 유저 (null도 공개 취급 → false인 경우만 제외)
    @Query("SELECT u FROM User u WHERE u.libraryPublic IS NULL OR u.libraryPublic = true")
    List<User> findPublicLibraryUsers();
}
