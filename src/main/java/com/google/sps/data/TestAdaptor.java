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

public class TestAdaptor { 
  public static void main(final String[] args) {
    try {
      System.out.println("try1");
      GetGovAdaptor adaptor = new GetGovAdaptor();
      System.out.println("try2");
      HashMap<Integer, GovSiteDetails> Map = adaptor.getSiteInfo();
      Integer testSite = 2560;
      System.out.println("in test adaptor, before printing map");
      System.out.println(Map);
      System.out.println(Map.get(2560).lat);
      System.out.println(Map.get(testSite).lat);
      System.out.println("in GetsiteIndo, after datamap before coord");

      Coordinates locationCoord = adaptor.getCoord(Map, testSite);
      System.out.println(locationCoord);
      System.out.println("in GetsiteIndo, after coord");

    } catch (final Exception e) {
      System.out.println("in Catch");
      System.out.println("getMessage(): " + e.getMessage()); 
    }
  }
}

