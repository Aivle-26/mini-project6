package com.aivle.bookapp.oauth;

import com.aivle.bookapp.entity.User;
import com.aivle.bookapp.repository.UserRepository;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.authentication.SimpleUrlAuthenticationSuccessHandler;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.io.IOException;

/**
 * Spring Boot 4.x / Spring Security 7.x 호환 버전
 * AuthenticationSuccessHandler 인터페이스 대신
 * SimpleUrlAuthenticationSuccessHandler 상속 방식 사용
 */
@Component
public class OAuth2SuccessHandler extends SimpleUrlAuthenticationSuccessHandler {

    private final UserRepository userRepository;
    private final String frontendUrl;

    public OAuth2SuccessHandler(
            UserRepository userRepository,
            @Value("${app.frontend-url:}") String frontendUrl
    ) {
        this.userRepository = userRepository;
        this.frontendUrl = frontendUrl;
        // 기본 redirect URL (onAuthenticationSuccess에서 덮어씀)
        setDefaultTargetUrl("/home");
    }

    @Override
    public void onAuthenticationSuccess(
            HttpServletRequest request,
            HttpServletResponse response,
            Authentication authentication
    ) throws IOException {

        OAuth2User oAuth2User = (OAuth2User) authentication.getPrincipal();

        // 구글에서 받은 사용자 정보
        String googleId = oAuth2User.getAttribute("sub");
        String email    = oAuth2User.getAttribute("email");
        String name     = oAuth2User.getAttribute("name");
        String picture  = oAuth2User.getAttribute("picture");

        // DB에서 googleId로 기존 사용자 조회 → 없으면 자동 회원가입
        User user = userRepository.findByGoogleId(googleId)
                .orElseGet(() ->
                        // 같은 이메일로 일반 회원가입한 계정이 있으면 googleId 연동
                        userRepository.findByEmail(email)
                                .map(existing -> {
                                    existing.setGoogleId(googleId);
                                    if (existing.getProfileImage() == null && picture != null) {
                                        existing.setProfileImage(picture);
                                    }
                                    return userRepository.save(existing);
                                })
                                .orElseGet(() -> {
                                    // 완전히 새 사용자 → 자동 회원가입
                                    String baseUsername = email.split("@")[0]
                                            .replaceAll("[^a-zA-Z0-9_]", "_");
                                    String username = makeUniqueUsername(baseUsername);
                                    String nickname = makeUniqueNickname(name != null ? name : baseUsername);

                                    return userRepository.save(
                                            User.builder()
                                                    .email(email)
                                                    .googleId(googleId)
                                                    .username(username)
                                                    .nickname(nickname)
                                                    .profileImage(picture)
                                                    .build()
                                    );
                                })
                );

        // 프론트엔드 OAuth 콜백 페이지로 redirect (userId 전달)
        getRedirectStrategy().sendRedirect(
                request, response,
                resolveFrontendUrl(request) + "/oauth-success?userId=" + user.getId()
        );
    }

    private String resolveFrontendUrl(HttpServletRequest request) {
        if (frontendUrl != null && !frontendUrl.isBlank()) {
            return frontendUrl.replaceAll("/+$", "");
        }

        String proto = request.getHeader("X-Forwarded-Proto");
        String host = request.getHeader("X-Forwarded-Host");
        if (host == null || host.isBlank()) {
            host = request.getHeader("Host");
        }
        if (proto == null || proto.isBlank()) {
            proto = request.getScheme();
        }
        return proto + "://" + host;
    }

    private String makeUniqueUsername(String base) {
        String candidate = base;
        int count = 1;
        while (userRepository.existsByUsername(candidate)) {
            candidate = base + count++;
        }
        return candidate;
    }

    private String makeUniqueNickname(String base) {
        String candidate = base;
        int count = 1;
        while (userRepository.existsByNickname(candidate)) {
            candidate = base + count++;
        }
        return candidate;
    }
}
