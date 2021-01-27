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


import com.google.gson.Gson;
import com.google.gson.reflect.TypeToken;
/** File to test the GetGovAdator file.
 */
public class TestAdaptor { 
  public static void main(final String[] args) {
    try {
      NSWGovAdaptor adaptor = new NSWGovAdaptor();
      HashMap<Integer, GovSiteDetails> Map = new HashMap<>();
      adaptor.updateSiteInfo();
      Integer testSite = 765;

      System.out.println(adaptor.getMap(Map));
      System.out.println(adaptor.getMap(Map).get(2560).lat);
      //System.out.println("hi");
      //System.out.println(adaptor.getMap(Map).get(testSite).lat);

      Coordinates locationCoord = adaptor.getCoord(testSite);
      System.out.println(locationCoord);

    } catch (final Exception e) {
      System.out.println("testAdaptor getMessage(): " + e.getMessage()); 
    }
  }
}