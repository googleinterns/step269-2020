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

/** File to run the GET request in java before putting it in the main adaptor function. 
 */
public class GetGovAdaptor {

  public static ArrayList<GovSiteDetails> getSiteInfo() throws Exception {
    //creating a get request
    URL url = new URL("https://data.airquality.nsw.gov.au/api/Data/get_SiteDetails");
    HttpURLConnection connection = (HttpURLConnection) url.openConnection();
    connection.setRequestMethod("GET");
    
    connection.setRequestProperty("Content-Type", "application/json");
    
    int responseCode = connection.getResponseCode();
    
    ArrayList<GovSiteDetails> convertedlist = null;
    if (responseCode == HttpURLConnection.HTTP_OK) {
      BufferedReader br = new BufferedReader(new InputStreamReader(connection.getInputStream()));
      StringBuilder response = new StringBuilder();
      String responseLine; 
      while ((responseLine = br.readLine()) != null) {
        response.append(responseLine.trim());
      }
 
      String responseString = response.toString();
      Gson gson = new Gson();
      convertedlist = gson.fromJson(responseString, new TypeToken<ArrayList<GovSiteDetails>>() {}.getType());
    } else {
      System.out.println("GET request did not work");
    }
    return convertedlist;
  }
}  