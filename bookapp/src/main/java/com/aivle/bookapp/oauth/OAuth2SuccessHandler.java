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
        setDefaultTargetUrl("/home");
    }

    @Override
    public void onAuthenticationSuccess(
            HttpServletRequest request,
            HttpServletResponse response,
            Authentication authentication
    ) throws IOException {

        OAuth2User oAuth2User = (OAuth2User) authentication.getPrincipal();

        String googleId = oAuth2User.getAttribute("sub");
        String email    = oAuth2User.getAttribute("email");
        String name     = oAuth2User.getAttribute("name");
        String picture  = oAuth2User.getAttribute("picture");

        User user = userRepository.findByGoogleId(googleId)
                .orElseGet(() ->
                        userRepository.findByEmail(email)
                                .map(existing -> {
                                    existing.setGoogleId(googleId);
                                    if (existing.getProfileImage() == null && picture != null) {
                                        existing.setProfileImage(picture);
                                    }
                                    return userRepository.save(existing);
                                })
                                .orElseGet(() -> {
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

        String base = resolveFrontendUrl(request);
        getRedirectStrategy().sendRedirect(
                request, response,
                base + "/oauth-success?userId=" + user.getId()
        );
    }

    private String resolveFrontendUrl(HttpServletRequest request) {
        // 1순위: application.yaml의 app.frontend-url (배포 환경)
        if (frontendUrl != null && !frontendUrl.isBlank()) {
            return frontendUrl.replaceAll("/+$", "");
        }

        // 2순위: Reverse proxy 헤더 (Nginx 등 앞에 있을 때)
        String proto = request.getHeader("X-Forwarded-Proto");
        String host  = request.getHeader("X-Forwarded-Host");

        if (host != null && !host.isBlank() && proto != null && !proto.isBlank()) {
            return proto + "://" + host;
        }

        // 3순위: 로컬 개발 기본값 → 프론트엔드는 항상 5173
        return "http://localhost:5173";
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