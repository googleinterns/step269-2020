package com.google.sps.data;

/**
 * A Custom Exception class for a HTTP Status Code that is not =200 OK.
 */
public class HTTPStatusCodeException extends Exception {
    public HTTPStatusCodeException(String errorMessage) {
        super(errorMessage);
    }
}