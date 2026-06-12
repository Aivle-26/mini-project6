package com.aivle.bookapp.exception;

public class FeedNotFoundException extends RuntimeException {

    public FeedNotFoundException(Long id) {
        super("피드를 찾을 수 없습니다. id: " + id);
    }
}
