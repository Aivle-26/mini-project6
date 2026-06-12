package com.aivle.bookapp.service;

import com.aivle.bookapp.dto.AuthResponse;
import com.aivle.bookapp.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class UserSearchService {

    private final UserRepository userRepository;

    // 비밀번호 해시 노출 방지를 위해 엔티티가 아닌 AuthResponse DTO로 반환
    public List<AuthResponse> searchUsers(String keyword) {
        return userRepository
                .findByNicknameContainingIgnoreCaseOrEmailContainingIgnoreCase(
                        keyword,
                        keyword
                )
                .stream().map(AuthResponse::new).toList();
    }
}
