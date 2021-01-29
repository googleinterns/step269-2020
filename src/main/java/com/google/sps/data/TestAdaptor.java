package com.google.sps.data;

import java.time.*;
import java.util.ArrayList;

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

      // Print to see if extract method returns the data for the corresponding correct day
      int theYear = 2021;
      int theMonth = 01;
      int theDay = 28;
      LocalDate theDate = LocalDate.of(theYear,theMonth,theDay);
      System.out.println(theDate);
      ArrayList<NSWGovAQDataPoint> list = adaptor.extractAQI(theDate);

      // Compare to see if adaptor.extractAQI(theDate) and list prints the same thing.
      System.out.println(adaptor.extractAQI(theDate));
      System.out.println(list);
      System.out.println(list.get(0));

      System.out.println(adaptor.convertDataPoint(list.get(0)));

    } catch (final Exception e) {
      System.out.println("testAdaptor getMessage(): " + e.getMessage()); 
    }
  }
}