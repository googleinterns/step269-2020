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

/** File to run the GET request in java before putting it in the main adaptor function. 
 */
public class GetGovAdaptor {
  public static void main(final String[] args) {
    try {
      ArrayList<GovSiteDetails> List = GetGovAdaptor.getSiteInfo();
      //System.out.println(List);
      
      //convert the array list into a map 
      HashMap<Integer, GovSiteDetails> map = new HashMap<>();
      for(GovSiteDetails details : List){
        map.put(details.siteId , details);
      }
      //System.out.println(map);
      System.out.println(map.get(765).lat);

      Coordinates locationCoord = getCoord(List, map);
      System.out.println(locationCoord);

    } catch (final Exception e) {
      System.out.println(e.getMessage());
    }
  }
  public static Coordinates getCoord(ArrayList<GovSiteDetails> List, HashMap<Integer, GovSiteDetails> Map) {
    return new Coordinates(Map.get(765).lng, Map.get(765).lat);
  }

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
      //System.out.println(convertedlist);
    } else {
      System.out.println("GET request did not work");
    }
    return convertedlist;
  }
 
}  
