package com.google.sps.data;

import java.time.*; 

/** 
 * File to test the GetGovAdator file.
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