package com.google.sps.data;

/**
 * A Custom Exception class for a HTTP Status Code that is not =200 OK.
 */
public class HTTPStatusCodeException extends Exception {
    private static final long serialVersionUID = -5237033659818337029L;

    public HTTPStatusCodeException(String errorMessage) {
        super(errorMessage);
    }
}