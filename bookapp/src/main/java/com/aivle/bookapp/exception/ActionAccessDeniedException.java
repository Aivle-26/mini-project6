package com.aivle.bookapp.exception;

public class ActionAccessDeniedException extends RuntimeException {

    public ActionAccessDeniedException(String message) {
        super(message);
    }
}
