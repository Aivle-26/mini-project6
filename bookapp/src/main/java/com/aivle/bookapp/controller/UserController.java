package com.aivle.bookapp.controller;

import com.aivle.bookapp.dto.AuthResponse;
import com.aivle.bookapp.dto.LoginRequest;
import com.aivle.bookapp.dto.SignupRequest;
import com.aivle.bookapp.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    @PostMapping("/auth/signup")
    public ResponseEntity<AuthResponse> signup(@Valid @RequestBody SignupRequest request) {
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(userService.signup(request));
    }

    @PostMapping("/auth/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest request) {
        return ResponseEntity.ok(userService.login(request));
    }

    @GetMapping("/auth/me")
    public ResponseEntity<AuthResponse> getMe(@RequestParam Long userId) {
        return ResponseEntity.ok(userService.getMe(userId));
    }

    @GetMapping("/users")
    public ResponseEntity<List<AuthResponse>> getAllUsers() {
        return ResponseEntity.ok(userService.getAllUsers());
    }

    // 공개 서재 유저 목록
    @GetMapping("/users/public")
    public ResponseEntity<List<AuthResponse>> getPublicLibraryUsers() {
        return ResponseEntity.ok(userService.getPublicLibraryUsers());
    }

    // 회원 탈퇴
    @DeleteMapping("/users/{id}")
    public ResponseEntity<Void> deleteUser(@PathVariable Long id) {
        userService.deleteUser(id);
        return ResponseEntity.noContent().build();
    }

    // 서재 공개 여부 토글
    @PatchMapping("/users/{id}/library-visibility")
    public ResponseEntity<AuthResponse> updateLibraryVisibility(
            @PathVariable Long id,
            @RequestBody Map<String, Object> body
    ) {
        boolean isPublic = Boolean.TRUE.equals(body.get("libraryPublic"));
        return ResponseEntity.ok(userService.updateLibraryVisibility(id, isPublic));
    }
}
