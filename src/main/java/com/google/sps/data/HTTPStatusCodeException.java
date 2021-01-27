package com.google.sps.data;

import java.io.BufferedReader;
import java.io.DataOutputStream;
import java.io.InputStreamReader;
import java.net.HttpURLConnection;
import java.net.URL;
import java.io.IOException;
import java.io.OutputStream;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/** A Custom Exception class for a HTTP Status Code that is not =200 OK.
 */
public class HTTPStatusCodeException extends Exception {
    public HTTPStatusCodeException(String errorMessage) {
        super(errorMessage);
    }
}