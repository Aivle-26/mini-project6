package com.aivle.bookapp.service;

import com.aivle.bookapp.dto.AuthResponse;
import com.aivle.bookapp.dto.LoginRequest;
import com.aivle.bookapp.dto.SignupRequest;
import com.aivle.bookapp.dto.UpdateProfileRequest;
import com.aivle.bookapp.entity.User;
import com.aivle.bookapp.repository.BookLikeRepository;
import com.aivle.bookapp.repository.BookRepository;
import com.aivle.bookapp.repository.BookshelfRepository;
import com.aivle.bookapp.repository.FeedCommentRepository;
import com.aivle.bookapp.repository.FeedLikeRepository;
import com.aivle.bookapp.repository.FeedRepository;
import com.aivle.bookapp.repository.FollowRepository;
import com.aivle.bookapp.repository.HighlightRepository;
import com.aivle.bookapp.repository.ReviewRepository;
import com.aivle.bookapp.repository.UserRepository;

import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional
public class UserService {

    private final UserRepository userRepository;
    private final FollowRepository followRepository;
    private final FeedRepository feedRepository;
    private final FeedLikeRepository feedLikeRepository;
    private final FeedCommentRepository feedCommentRepository;
    private final BookRepository bookRepository;
    private final BookLikeRepository bookLikeRepository;
    private final ReviewRepository reviewRepository;
    private final HighlightRepository highlightRepository;
    private final BookshelfRepository bookshelfRepository;
    private final BCryptPasswordEncoder passwordEncoder;

    // 회원가입
    public AuthResponse signup(SignupRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new IllegalArgumentException("이미 사용 중인 이메일입니다.");
        }
        if (userRepository.existsByUsername(request.getUsername())) {
            throw new IllegalArgumentException("이미 사용 중인 아이디입니다.");
        }
        if (userRepository.existsByNickname(request.getNickname())) {
            throw new IllegalArgumentException("이미 사용 중인 닉네임입니다.");
        }

        User user = User.builder()
                .email(request.getEmail())
                .username(request.getUsername())
                .nickname(request.getNickname())
                .password(passwordEncoder.encode(request.getPassword()))
                .build();

        return new AuthResponse(userRepository.save(user));
    }

    // 로그인
    @Transactional(readOnly = true)
    public AuthResponse login(LoginRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new IllegalArgumentException("이메일 또는 비밀번호가 올바르지 않습니다."));

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new IllegalArgumentException("이메일 또는 비밀번호가 올바르지 않습니다.");
        }

        return new AuthResponse(user);
    }

    // 현재 사용자 조회 (id로)
    @Transactional(readOnly = true)
    public AuthResponse getMe(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다."));
        return new AuthResponse(user);
    }

    // 사용자 프로필 조회 (username으로)
    @Transactional(readOnly = true)
    public User getUserByUsername(String username) {
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다."));
    }

    // 전체 사용자 목록
    @Transactional(readOnly = true)
    public List<AuthResponse> getAllUsers() {
        return userRepository.findAll()
                .stream().map(AuthResponse::new).toList();
    }

    // 서재 공개 여부 토글
    public AuthResponse updateLibraryVisibility(Long id, boolean isPublic) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다."));
        user.setLibraryPublic(isPublic);
        return new AuthResponse(user);
    }

    // 공개 서재 유저 목록 (libraryPublic = false 인 경우만 제외, null은 공개 취급)
    @Transactional(readOnly = true)
    public List<AuthResponse> getPublicLibraryUsers() {
        return userRepository.findPublicLibraryUsers()
                .stream().map(AuthResponse::new).toList();
    }

    // 회원 탈퇴
    public void deleteUser(Long id) {
        if (!userRepository.existsById(id)) {
            throw new IllegalArgumentException("사용자를 찾을 수 없습니다.");
        }
        // 팔로우 레코드 삭제 → 다른 유저 팔로워/팔로잉 카운트 자동 반영
        followRepository.deleteByFollowerIdOrFollowingId(id, id);
        // 본인 피드 및 상호작용 삭제 → 팔로워 홈피드에서 제거
        feedRepository.deleteByUserId(id);
        feedLikeRepository.deleteByUserId(id);
        feedCommentRepository.deleteByUserId(id);
        // 본인이 남긴 도서 관련 데이터 정리 (고아 레코드 방지)
        reviewRepository.deleteByUserId(id);
        highlightRepository.deleteByUserId(id);
        bookLikeRepository.deleteByUserId(id);
        bookshelfRepository.deleteByUserId(id);
        bookRepository.deleteByUserId(id);
        userRepository.deleteById(id);
    }

    // 프로필 수정
    public AuthResponse updateProfile(Long id, UpdateProfileRequest request) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다."));

        if (request.getNickname() != null && !request.getNickname().equals(user.getNickname())) {
            if (userRepository.existsByNickname(request.getNickname())) {
                throw new IllegalArgumentException("이미 사용 중인 닉네임입니다.");
            }
            user.setNickname(request.getNickname());
        }

        if (request.getUsername() != null && !request.getUsername().equals(user.getUsername())) {
            if (userRepository.existsByUsername(request.getUsername())) {
                throw new IllegalArgumentException("이미 사용 중인 아이디입니다.");
            }
            user.setUsername(request.getUsername());
        }

        if (request.getBio() != null) {
            user.setBio(request.getBio());
        }

        if (request.getProfileImage() != null) {
            user.setProfileImage(request.getProfileImage());
        }

        return new AuthResponse(user);
    }
}
