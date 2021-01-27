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
import java.time.*;


import com.google.gson.Gson;
import com.google.gson.reflect.TypeToken;
/** File to test the GetGovAdator file.
 */
public class TestAdaptor { 
  public static void main(final String[] args) {
    try {
      NSWGovAdaptor adaptor = new NSWGovAdaptor();
      Integer testSite = 765;

      System.out.println(adaptor.getMap());
      System.out.println(adaptor.getMap().get(765).lat);
      System.out.println(adaptor.getMap().get(testSite).lat);

      Coordinates locationCoord = adaptor.getCoord(testSite);
      System.out.println(locationCoord);

      int theYear = 2021;
      int theMonth = 01;
      int theDay = 28;
      LocalDate theDate = LocalDate.of(theYear,theMonth,theDay);
      System.out.println(theDate);
      System.out.println(adaptor.extractAQI(theDate));

    } catch (final Exception e) {
      System.out.println("testAdaptor getMessage(): " + e.getMessage()); 
    }
  }
}