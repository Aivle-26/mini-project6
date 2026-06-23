package com.aivle.bookapp.config;

import com.aivle.bookapp.oauth.OAuth2SuccessHandler;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
@EnableWebSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final OAuth2SuccessHandler oAuth2SuccessHandler;

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            // CSRF 비활성화 (REST API 방식이므로)
            .csrf(csrf -> csrf.disable())

            // 모든 요청 허용 (인증은 컨트롤러에서 userId로 처리)
            .authorizeHttpRequests(auth -> auth
                .anyRequest().permitAll()
            )

            // 구글 OAuth2 로그인 설정
            .oauth2Login(oauth2 -> oauth2
                .successHandler(oAuth2SuccessHandler)
            )

            // Spring Security 기본 로그인 폼 비활성화
            .formLogin(form -> form.disable());

        return http.build();
    }
}
