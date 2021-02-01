package com.google.sps.data;

/**
 * A Custom Exception class for an Empty List Exception. 
 */
public class EmptyListException extends Exception {
    public EmptyListException(String errorMessage) {
        super(errorMessage);
    }
}