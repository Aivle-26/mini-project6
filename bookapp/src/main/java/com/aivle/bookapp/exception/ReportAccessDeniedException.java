package com.aivle.bookapp.exception;

public class ReportAccessDeniedException extends RuntimeException {
    public ReportAccessDeniedException() {
        super("본인의 독서 리포트만 조회할 수 있습니다.");
    }
}
