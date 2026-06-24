package com.aivle.bookapp.service;

import com.aivle.bookapp.dto.ReadingReportResponse;
import com.aivle.bookapp.entity.Book;
import com.aivle.bookapp.entity.Highlight;
import com.aivle.bookapp.entity.Review;
import com.aivle.bookapp.exception.AiReportGenerationException;
import com.aivle.bookapp.exception.ReportAccessDeniedException;
import com.aivle.bookapp.exception.UserNotFoundException;
import com.aivle.bookapp.repository.BookRepository;
import com.aivle.bookapp.repository.HighlightRepository;
import com.aivle.bookapp.repository.ReviewRepository;
import com.aivle.bookapp.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.dao.DataAccessException;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestClientResponseException;
import org.springframework.web.client.RestTemplate;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class AnalyticsService {

    private static final Map<String, String> STATUS_LABELS = Map.of(
            "want", "읽고 싶음",
            "reading", "읽는 중",
            "stopped", "중단",
            "finished", "완독"
    );

    private static final Set<String> EMOTIONAL_KEYWORDS = Set.of(
            "감성", "위로", "공감", "따뜻", "잔잔", "슬픔", "눈물", "사랑", "마음", "여운"
    );

    private static final Set<String> THINKING_KEYWORDS = Set.of(
            "철학", "생각", "질문", "사회", "역사", "과학", "지식", "인문", "분석", "성찰"
    );

    private final BookRepository bookRepository;
    private final ReviewRepository reviewRepository;
    private final HighlightRepository highlightRepository;
    private final UserRepository userRepository;

    public ReadingReportResponse getReadingReport(Long userId, Long requesterId) {
        if (requesterId == null || !requesterId.equals(userId)) {
            throw new ReportAccessDeniedException();
        }
        if (!userRepository.existsById(userId)) {
            throw new UserNotFoundException(userId);
        }

        List<String> warnings = new ArrayList<>();
        List<Book> books = bookRepository.findByUserIdAndDeletedAtIsNull(userId);
        List<Review> reviews = safeFindReviews(userId, warnings);
        List<Highlight> highlights = safeFindHighlights(userId, warnings);

        int totalBooks = books.size();
        int finishedBooks = countByStatus(books, "finished");
        int readingBooks = countByStatus(books, "reading");
        double averageRating = reviews.stream()
                .filter(r -> r.getRating() != null)
                .mapToInt(Review::getRating)
                .average()
                .orElse(0);
        double completionRate = totalBooks == 0 ? 0 : round(finishedBooks * 100.0 / totalBooks);

        Map<String, Long> genreCounts = countGenres(books);
        Map<String, Long> moodCounts = countMoods(books);
        Map<String, Long> statusCounts = countStatuses(books);

        int diversityScore = scoreByRatio(genreCounts.size(), 7);
        int emotionScore = calculateKeywordScore(books, reviews, highlights, EMOTIONAL_KEYWORDS, moodCounts, "감성");
        int thinkingScore = calculateKeywordScore(books, reviews, highlights, THINKING_KEYWORDS, genreCounts, "인문");
        int completionScore = clamp((int) Math.round(completionRate * 0.85 + readingBooks * 4));
        int expressionScore = scoreByRatio(reviews.size() + highlights.size(), Math.max(totalBooks * 2, 4));
        int curiosityScore = clamp(scoreByRatio(countByStatus(books, "want") + readingBooks, Math.max(totalBooks, 3)) + diversityScore / 4);

        List<ReadingReportResponse.ScoreItem> scores = List.of(
                new ReadingReportResponse.ScoreItem("diversity", "탐색력", diversityScore, "여러 장르를 넓게 탐색하는 정도"),
                new ReadingReportResponse.ScoreItem("emotion", "감성 밀도", emotionScore, "감정과 분위기에 반응하는 정도"),
                new ReadingReportResponse.ScoreItem("thinking", "사유 깊이", thinkingScore, "생각할 거리를 남기는 책을 고르는 정도"),
                new ReadingReportResponse.ScoreItem("completion", "완독 추진력", completionScore, "읽기 시작한 책을 끝까지 가져가는 힘"),
                new ReadingReportResponse.ScoreItem("expression", "기록 성향", expressionScore, "리뷰와 하이라이트로 독서를 남기는 정도"),
                new ReadingReportResponse.ScoreItem("curiosity", "호기심", curiosityScore, "읽고 싶은 책과 진행 중인 책의 확장성")
        );

        String readerType = totalBooks == 0 ? "분석 대기 중" : pickReaderType(scores);
        String readerTypeDescription = describeReaderType(readerType);
        List<String> insights = buildInsights(books, reviews, highlights, genreCounts, moodCounts, readerType, completionRate, averageRating);
        warnings.addAll(buildWarnings(totalBooks, reviews.size(), highlights.size(), genreCounts.size(), moodCounts.size()));
        String analysisStatus = warnings.isEmpty() ? "READY" : "NEEDS_MORE_DATA";
        String summary = buildSummary(readerType, genreCounts, moodCounts, completionRate, averageRating);
        int dataQuality = clamp(scoreByRatio(totalBooks, 10) * 55 / 100
                + scoreByRatio(reviews.size(), 6) * 25 / 100
                + scoreByRatio(highlights.size(), 6) * 20 / 100);

        return new ReadingReportResponse(
                userId,
                readerType,
                readerTypeDescription,
                summary,
                analysisStatus,
                totalBooks,
                finishedBooks,
                readingBooks,
                reviews.size(),
                highlights.size(),
                round(averageRating),
                completionRate,
                dataQuality,
                scores,
                toDistribution(genreCounts, totalBooks, 6),
                toDistribution(moodCounts, moodCounts.values().stream().mapToLong(Long::longValue).sum(), 8),
                toDistribution(statusCounts, totalBooks, 4),
                insights,
                warnings
        );
    }

    public ReadingReportResponse getAiReadingReport(Long userId, Long requesterId, String apiKey, String model) {
        if (!hasText(apiKey)) {
            throw new IllegalArgumentException("OpenAI API 키를 입력해주세요.");
        }

        ReadingReportResponse baseReport = getReadingReport(userId, requesterId);
        String selectedModel = hasText(model) ? model.trim() : "gpt-4o-mini";
        AiInsight aiInsight = requestAiInsight(baseReport, selectedModel, apiKey.trim());

        List<String> warnings = new ArrayList<>(baseReport.getWarnings());
        warnings.add("LLM 인사이트가 적용되었습니다. API 응답 실패 시 기본 규칙 기반 리포트를 사용할 수 있습니다.");

        return new ReadingReportResponse(
                baseReport.getUserId(),
                fallback(aiInsight.readerType(), baseReport.getReaderType()),
                fallback(aiInsight.readerTypeDescription(), baseReport.getReaderTypeDescription()),
                fallback(aiInsight.summary(), baseReport.getSummary()),
                "AI_ENHANCED",
                baseReport.getTotalBooks(),
                baseReport.getFinishedBooks(),
                baseReport.getReadingBooks(),
                baseReport.getReviewCount(),
                baseReport.getHighlightCount(),
                baseReport.getAverageRating(),
                baseReport.getCompletionRate(),
                baseReport.getDataQuality(),
                baseReport.getScores(),
                baseReport.getGenreDistribution(),
                baseReport.getMoodDistribution(),
                baseReport.getStatusDistribution(),
                aiInsight.insights().isEmpty() ? baseReport.getInsights() : aiInsight.insights(),
                warnings
        );
    }

    private AiInsight requestAiInsight(ReadingReportResponse report, String model, String apiKey) {
        RestTemplate restTemplate = new RestTemplate();

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.setBearerAuth(apiKey);

        Map<String, Object> responseFormat = Map.of("type", "json_object");
        Map<String, Object> body = Map.of(
                "model", model,
                "temperature", 0.6,
                "response_format", responseFormat,
                "messages", List.of(
                        Map.of(
                                "role", "system",
                                "content", """
                                        너는 독서 데이터 분석가다. 반드시 한국어 JSON만 반환한다.
                                        마크다운, 설명문, 코드블록은 절대 쓰지 않는다.
                                        JSON 스키마:
                                        {
                                          "readerType": "짧은 독서 타입명",
                                          "readerTypeDescription": "한 문장 설명",
                                          "summary": "2문장 이내의 종합 분석",
                                          "insights": ["인사이트 1", "인사이트 2", "인사이트 3"]
                                        }
                                        """
                        ),
                        Map.of(
                                "role", "user",
                                "content", buildAiPrompt(report)
                        )
                )
        );

        try {
            Map<String, Object> response = postChatCompletion(restTemplate, headers, body);
            return parseAiInsight(response);
        } catch (RestClientResponseException e) {
            throw new AiReportGenerationException(parseOpenAiError(e));
        }
    }

    private Map<String, Object> postChatCompletion(RestTemplate restTemplate, HttpHeaders headers, Map<String, Object> body) {
        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(body, headers);
        @SuppressWarnings("rawtypes")
        Map response = restTemplate.postForObject(
                "https://api.openai.com/v1/chat/completions",
                entity,
                Map.class
        );

        if (response == null) {
            throw new AiReportGenerationException("AI 응답을 받지 못했습니다.");
        }

        Object choicesObj = response.get("choices");
        if (!(choicesObj instanceof List<?> choices) || choices.isEmpty()) {
            throw new AiReportGenerationException("AI 응답 형식이 올바르지 않습니다.");
        }

        Object firstChoice = choices.get(0);
        if (!(firstChoice instanceof Map<?, ?> choiceMap)) {
            throw new AiReportGenerationException("AI 응답 선택지 형식이 올바르지 않습니다.");
        }

        Object messageObj = choiceMap.get("message");
        if (!(messageObj instanceof Map<?, ?> messageMap)) {
            throw new AiReportGenerationException("AI 응답 메시지 형식이 올바르지 않습니다.");
        }

        Object content = messageMap.get("content");
        String contentText = content == null ? "" : String.valueOf(content);
        if (!hasText(contentText)) {
            throw new AiReportGenerationException("AI 응답이 비어 있습니다.");
        }
        return parseSimpleJsonObject(contentText);
    }

    private String buildAiPrompt(ReadingReportResponse report) {
        String scores = report.getScores().stream()
                .map(score -> score.getLabel() + "=" + score.getValue())
                .collect(Collectors.joining(", "));
        String genres = report.getGenreDistribution().stream()
                .map(item -> item.getLabel() + "(" + item.getPercentage() + "%)")
                .collect(Collectors.joining(", "));
        String moods = report.getMoodDistribution().stream()
                .map(item -> item.getLabel() + "(" + item.getPercentage() + "%)")
                .collect(Collectors.joining(", "));
        String statuses = report.getStatusDistribution().stream()
                .map(item -> item.getLabel() + "(" + item.getCount() + "권)")
                .collect(Collectors.joining(", "));

        return """
                아래는 한 사용자의 독서 행동 분석 데이터다.
                기존 타입: %s
                기존 요약: %s
                총 책 수: %d
                완독 책 수: %d
                읽는 중 책 수: %d
                완독률: %.1f%%
                평균 별점: %.1f
                리뷰 수: %d
                하이라이트 수: %d
                데이터 신뢰도: %d%%
                성향 점수: %s
                장르 분포: %s
                분위기 분포: %s
                독서 상태 분포: %s

                요청:
                - 사용자를 비난하거나 과장하지 말고 부드럽게 분석한다.
                - readerType은 8자 이내의 기억하기 쉬운 이름으로 만든다.
                - summary는 발표/서비스 화면에 바로 보여도 자연스러운 문장으로 작성한다.
                - insights는 3개만 작성한다.
                - 반드시 JSON만 반환한다.
                """.formatted(
                report.getReaderType(),
                report.getSummary(),
                report.getTotalBooks(),
                report.getFinishedBooks(),
                report.getReadingBooks(),
                report.getCompletionRate(),
                report.getAverageRating(),
                report.getReviewCount(),
                report.getHighlightCount(),
                report.getDataQuality(),
                emptyIfBlank(scores),
                emptyIfBlank(genres),
                emptyIfBlank(moods),
                emptyIfBlank(statuses)
        );
    }

    private AiInsight parseAiInsight(Map<String, Object> parsed) {
        List<String> insights = new ArrayList<>();
        Object insightsObj = parsed.get("insights");
        if (insightsObj instanceof List<?> insightList) {
            for (Object insight : insightList) {
                if (hasText(String.valueOf(insight))) {
                    insights.add(String.valueOf(insight));
                }
            }
        }
        return new AiInsight(
                stringValue(parsed.get("readerType")),
                stringValue(parsed.get("readerTypeDescription")),
                stringValue(parsed.get("summary")),
                insights.stream().limit(3).collect(Collectors.toList())
        );
    }

    private String parseOpenAiError(RestClientResponseException e) {
        String body = e.getResponseBodyAsString();
        String message = extractJsonString(body, "message");
        if (hasText(message)) {
            return "AI 인사이트 생성 실패: " + message;
        }
        return "AI 인사이트 생성 실패: OpenAI API 요청이 실패했습니다. (" + e.getStatusCode() + ")";
    }

    private Map<String, Object> parseSimpleJsonObject(String json) {
        Map<String, Object> result = new HashMap<>();
        result.put("readerType", extractJsonString(json, "readerType"));
        result.put("readerTypeDescription", extractJsonString(json, "readerTypeDescription"));
        result.put("summary", extractJsonString(json, "summary"));
        result.put("insights", extractJsonStringArray(json, "insights"));
        if (!hasText(stringValue(result.get("summary"))) && ((List<?>) result.get("insights")).isEmpty()) {
            throw new AiReportGenerationException("AI 응답 JSON을 해석하지 못했습니다.");
        }
        return result;
    }

    private String extractJsonString(String json, String fieldName) {
        if (!hasText(json)) return "";
        String key = "\"" + fieldName + "\"";
        int keyIndex = json.indexOf(key);
        if (keyIndex < 0) return "";
        int colonIndex = json.indexOf(':', keyIndex + key.length());
        if (colonIndex < 0) return "";
        int firstQuote = json.indexOf('"', colonIndex + 1);
        if (firstQuote < 0) return "";
        StringBuilder value = new StringBuilder();
        boolean escaping = false;
        for (int i = firstQuote + 1; i < json.length(); i++) {
            char c = json.charAt(i);
            if (escaping) {
                value.append(switch (c) {
                    case 'n' -> '\n';
                    case 't' -> '\t';
                    case 'r' -> '\r';
                    case '"' -> '"';
                    case '\\' -> '\\';
                    default -> c;
                });
                escaping = false;
                continue;
            }
            if (c == '\\') {
                escaping = true;
                continue;
            }
            if (c == '"') {
                return value.toString();
            }
            value.append(c);
        }
        return "";
    }

    private List<String> extractJsonStringArray(String json, String fieldName) {
        List<String> result = new ArrayList<>();
        if (!hasText(json)) return result;
        String key = "\"" + fieldName + "\"";
        int keyIndex = json.indexOf(key);
        if (keyIndex < 0) return result;
        int arrayStart = json.indexOf('[', keyIndex + key.length());
        if (arrayStart < 0) return result;
        int arrayEnd = json.indexOf(']', arrayStart + 1);
        if (arrayEnd < 0) return result;
        String arrayBody = json.substring(arrayStart + 1, arrayEnd);

        int index = 0;
        while (index < arrayBody.length()) {
            int quote = arrayBody.indexOf('"', index);
            if (quote < 0) break;
            StringBuilder value = new StringBuilder();
            boolean escaping = false;
            int i = quote + 1;
            for (; i < arrayBody.length(); i++) {
                char c = arrayBody.charAt(i);
                if (escaping) {
                    value.append(c);
                    escaping = false;
                    continue;
                }
                if (c == '\\') {
                    escaping = true;
                    continue;
                }
                if (c == '"') {
                    break;
                }
                value.append(c);
            }
            if (hasText(value.toString())) {
                result.add(value.toString());
            }
            index = i + 1;
        }
        return result;
    }

    private String stringValue(Object value) {
        return value == null ? "" : String.valueOf(value);
    }

    private String fallback(String value, String fallback) {
        return hasText(value) ? value : fallback;
    }

    private String emptyIfBlank(String value) {
        return hasText(value) ? value : "없음";
    }

    private List<Review> safeFindReviews(Long userId, List<String> warnings) {
        try {
            return reviewRepository.findByUserId(userId);
        } catch (DataAccessException e) {
            warnings.add("리뷰 데이터를 읽는 중 문제가 발생해 리뷰 기반 분석을 건너뛰었습니다.");
            return List.of();
        }
    }

    private List<Highlight> safeFindHighlights(Long userId, List<String> warnings) {
        try {
            return highlightRepository.findByUserIdOrderByIdDesc(userId);
        } catch (DataAccessException e) {
            warnings.add("하이라이트 데이터를 읽는 중 문제가 발생해 문장 기반 분석을 건너뛰었습니다.");
            return List.of();
        }
    }

    private int countByStatus(List<Book> books, String status) {
        return (int) books.stream()
                .filter(b -> status.equals(b.getReadingStatus()))
                .count();
    }

    private Map<String, Long> countGenres(List<Book> books) {
        return books.stream()
                .map(Book::getGenre)
                .filter(this::hasText)
                .map(String::trim)
                .collect(Collectors.groupingBy(g -> g, HashMap::new, Collectors.counting()));
    }

    private Map<String, Long> countMoods(List<Book> books) {
        Map<String, Long> result = new HashMap<>();
        for (Book book : books) {
            if (book.getMoods() == null) continue;
            for (String mood : book.getMoods()) {
                if (hasText(mood)) {
                    result.merge(mood.trim(), 1L, Long::sum);
                }
            }
        }
        return result;
    }

    private Map<String, Long> countStatuses(List<Book> books) {
        Map<String, Long> result = new LinkedHashMap<>();
        for (Book book : books) {
            String status = book.getReadingStatus();
            String label = hasText(status) ? STATUS_LABELS.getOrDefault(status, "미분류") : "미분류";
            result.merge(label, 1L, Long::sum);
        }
        return result;
    }

    private int calculateKeywordScore(
            List<Book> books,
            List<Review> reviews,
            List<Highlight> highlights,
            Set<String> keywords,
            Map<String, Long> tagCounts,
            String tagHint
    ) {
        long keywordHits = 0;
        for (String keyword : keywords) {
            keywordHits += books.stream().filter(b -> containsAny(b.getTitle(), keyword) || containsAny(b.getDescription(), keyword)).count();
            keywordHits += reviews.stream().filter(r -> containsAny(r.getContent(), keyword)).count();
            keywordHits += highlights.stream().filter(h -> containsAny(h.getQuote(), keyword) || containsAny(h.getNote(), keyword)).count();
        }
        long tagHits = tagCounts.entrySet().stream()
                .filter(e -> e.getKey().contains(tagHint) || keywords.stream().anyMatch(k -> e.getKey().contains(k)))
                .mapToLong(Map.Entry::getValue)
                .sum();
        return clamp(25 + (int) Math.min(55, (keywordHits + tagHits) * 9) + (reviews.isEmpty() ? 0 : 8));
    }

    private List<ReadingReportResponse.DistributionItem> toDistribution(Map<String, Long> counts, long total, int limit) {
        if (total <= 0) {
            return List.of();
        }
        return counts.entrySet().stream()
                .sorted(Map.Entry.<String, Long>comparingByValue().reversed())
                .limit(limit)
                .map(e -> new ReadingReportResponse.DistributionItem(e.getKey(), e.getValue(), round(e.getValue() * 100.0 / total)))
                .collect(Collectors.toList());
    }

    private String pickReaderType(List<ReadingReportResponse.ScoreItem> scores) {
        ReadingReportResponse.ScoreItem top = scores.stream()
                .max(Comparator.comparingInt(ReadingReportResponse.ScoreItem::getValue))
                .orElse(scores.get(0));

        return switch (top.getKey()) {
            case "emotion" -> "감성 수집가";
            case "thinking" -> "사유 탐험가";
            case "completion" -> "완독 추진형";
            case "expression" -> "기록형 독자";
            case "curiosity" -> "호기심 확장형";
            default -> "장르 탐험가";
        };
    }

    private String describeReaderType(String readerType) {
        return switch (readerType) {
            case "감성 수집가" -> "책에서 감정의 결을 발견하고 오래 남는 분위기를 잘 붙잡는 독자입니다.";
            case "사유 탐험가" -> "책을 통해 질문을 만들고 생각을 확장하는 데 강한 독자입니다.";
            case "완독 추진형" -> "읽기 시작한 책을 끝까지 완주하는 힘이 좋은 독자입니다.";
            case "기록형 독자" -> "리뷰와 문장 기록으로 독서 경험을 자기 언어로 남기는 독자입니다.";
            case "호기심 확장형" -> "읽고 싶은 책을 계속 발견하며 독서 반경을 넓히는 독자입니다.";
            case "분석 대기 중" -> "내 서재에 책을 추가하면 독서 성향을 분석할 수 있습니다.";
            default -> "한 가지 취향에 머물지 않고 다양한 책을 건너 다니는 독자입니다.";
        };
    }

    private List<String> buildInsights(
            List<Book> books,
            List<Review> reviews,
            List<Highlight> highlights,
            Map<String, Long> genreCounts,
            Map<String, Long> moodCounts,
            String readerType,
            double completionRate,
            double averageRating
    ) {
        List<String> insights = new ArrayList<>();

        if (books.isEmpty()) {
            insights.add("아직 분석할 책이 부족합니다. 내 서재에 책을 추가하면 성향 리포트가 더 선명해집니다.");
            return insights;
        }

        topLabel(genreCounts).ifPresent(genre ->
                insights.add("가장 강하게 드러나는 장르는 '" + genre + "'입니다. 현재 서재의 중심 취향으로 볼 수 있습니다.")
        );
        topLabel(moodCounts).ifPresent(mood ->
                insights.add("책을 고를 때 '" + mood + "' 분위기에 자주 반응하고 있습니다.")
        );

        if (completionRate >= 65) {
            insights.add("완독률이 높은 편입니다. 관심 있는 책을 끝까지 밀고 가는 독서 루틴이 잡혀 있습니다.");
        } else if (completionRate > 0) {
            insights.add("완독보다 탐색 비중이 높은 편입니다. 읽고 싶은 책을 넓게 살펴보는 패턴이 보입니다.");
        }

        if (averageRating >= 4.2) {
            insights.add("평균 별점이 높습니다. 책 선택 기준이 본인 취향과 꽤 잘 맞고 있습니다.");
        } else if (!reviews.isEmpty()) {
            insights.add("별점 편차를 활용하면 더 정교한 추천으로 확장하기 좋습니다.");
        }

        if (reviews.size() + highlights.size() >= Math.max(books.size(), 3)) {
            insights.add("리뷰와 하이라이트 기록량이 충분합니다. 단순한 목록보다 기억을 남기는 방식의 독서를 하고 있습니다.");
        }

        insights.add("현재 리포트 기준 독서 타입은 '" + readerType + "'입니다.");
        return insights.stream().limit(5).collect(Collectors.toList());
    }

    private List<String> buildWarnings(int totalBooks, int reviewCount, int highlightCount, int genreCount, int moodCount) {
        List<String> warnings = new ArrayList<>();
        if (totalBooks == 0) {
            warnings.add("서재에 등록된 책이 없어 리포트가 대기 상태입니다.");
            return warnings;
        }
        if (totalBooks < 3) {
            warnings.add("책이 3권 미만이라 성향 타입의 정확도가 낮을 수 있습니다.");
        }
        if (genreCount == 0) {
            warnings.add("장르 정보가 없어 장르 기반 분석을 건너뛰었습니다.");
        }
        if (moodCount == 0) {
            warnings.add("분위기 태그가 없어 감성 밀도 분석이 제한됩니다.");
        }
        if (reviewCount == 0) {
            warnings.add("리뷰가 없어 평균 별점과 기록 성향 분석이 제한됩니다.");
        }
        if (highlightCount == 0) {
            warnings.add("하이라이트가 없어 문장 기록 기반 인사이트가 제한됩니다.");
        }
        return warnings;
    }

    private String buildSummary(
            String readerType,
            Map<String, Long> genreCounts,
            Map<String, Long> moodCounts,
            double completionRate,
            double averageRating
    ) {
        String genre = topLabel(genreCounts).orElse("아직 뚜렷한 장르 없음");
        String mood = topLabel(moodCounts).orElse("아직 뚜렷한 분위기 없음");
        String ratingText = averageRating > 0 ? String.format(Locale.KOREA, "평균 별점 %.1f점", averageRating) : "별점 기록 부족";
        return "%s 타입입니다. %s 장르와 %s 분위기가 두드러지고, 완독률은 %.1f%%, %s으로 분석됩니다."
                .formatted(readerType, genre, mood, completionRate, ratingText);
    }

    private java.util.Optional<String> topLabel(Map<String, Long> counts) {
        return counts.entrySet().stream()
                .max(Map.Entry.comparingByValue())
                .map(Map.Entry::getKey);
    }

    private int scoreByRatio(int value, int target) {
        if (target <= 0) return 0;
        return clamp((int) Math.round(value * 100.0 / target));
    }

    private boolean containsAny(String text, String keyword) {
        return hasText(text) && text.toLowerCase(Locale.ROOT).contains(keyword.toLowerCase(Locale.ROOT));
    }

    private boolean hasText(String value) {
        return value != null && !value.isBlank();
    }

    private int clamp(int value) {
        return Math.max(0, Math.min(100, value));
    }

    private double round(double value) {
        return Math.round(value * 10.0) / 10.0;
    }

    private record AiInsight(
            String readerType,
            String readerTypeDescription,
            String summary,
            List<String> insights
    ) {
    }

}
