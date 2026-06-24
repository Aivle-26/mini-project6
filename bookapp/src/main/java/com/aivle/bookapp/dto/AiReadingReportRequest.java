package com.aivle.bookapp.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class AiReadingReportRequest {
    private Long requesterId;
    private String apiKey;
    private String model;
}
