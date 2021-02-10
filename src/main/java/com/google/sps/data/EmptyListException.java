package com.google.sps.data;

/**
 * A Custom Exception class for an Empty List Exception. 
 */
public class EmptyListException extends Exception {
    private static final long serialVersionUID = 6243104809253949369L;

    public EmptyListException(String errorMessage) {
        super(errorMessage);
    }
}