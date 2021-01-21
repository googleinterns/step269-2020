package com.google.sps.data;

import java.io.BufferedReader;
import java.io.DataOutputStream;
import java.io.InputStreamReader;
import java.net.HttpURLConnection;
import java.net.URL;
import java.io.IOException;
import java.io.OutputStream;
import java.util.ArrayList;

import com.google.gson.Gson;
import com.google.gson.reflect.TypeToken;

/** File to run the get request in java before putting it in the main adaptor function. 
 */
public class GetGovAdaptor {
  public static void main(final String[] args) {
    try {
      GetGovAdaptor.getSiteInfo();
    } catch (final Exception e) {
      System.out.println(e.getMessage());
    }
  }

  public static void getSiteInfo() throws Exception {
    //creating a get request
    URL url = new URL("https://data.airquality.nsw.gov.au/api/Data/get_SiteDetails");
    HttpURLConnection connection = (HttpURLConnection) url.openConnection();
    connection.setRequestMethod("GET");
    
    //set request header 
    connection.setRequestProperty("Content-Type", "application/json");
    
    int responseCode = connection.getResponseCode();
    System.out.println("\nSending 'GET' request to URL : " + url);
    System.out.println("Response Code : " + responseCode);
    
    if (responseCode == HttpURLConnection.HTTP_OK) {
      BufferedReader br = new BufferedReader(new InputStreamReader(connection.getInputStream()));
      StringBuilder response = new StringBuilder();
      String responseLine; 
      while ((responseLine = br.readLine()) != null) {
        response.append(responseLine.trim());
      }

      //print result 
      System.out.println(response.toString());
    } else {
      System.out.println("GET request did not work");
    }
  }
}  