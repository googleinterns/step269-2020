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

  private HashMap<Integer, GovSiteDetails> dataMap;

  public GetGovAdaptor() {
    dataMap = new HashMap<>();
  }
  
  public void setMap(HashMap<Integer, GovSiteDetails> dataMap) {
    this.dataMap = dataMap;
  }

  public HashMap<Integer, GovSiteDetails> getMap(HashMap<Integer, GovSiteDetails> dataMap) {
    return this.dataMap;
  }

  public Coordinates getCoord(HashMap<Integer, GovSiteDetails> Map, Integer siteId) {
    return new Coordinates(Map.get(siteId).lng, Map.get(siteId).lat);
  }

  public HashMap<Integer, GovSiteDetails> getSiteInfo() throws Exception {
    //creating a get request
    URL url = new URL("https://data.airquality.nsw.gov.au/api/Data/get_SiteDetails");
    HttpURLConnection connection = (HttpURLConnection) url.openConnection();
    connection.setRequestMethod("GET");
    
    connection.setRequestProperty("Content-Type", "application/json");
    
    int responseCode = connection.getResponseCode();

    ArrayList<GovSiteDetails> convertedlist = null;
    //HashMap<Integer, GovSiteDetails> map = new HashMap<>();
    //MapClass mapClass = new MapClass();

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
      System.out.println("hello");

      //Convert the arrayList into a map. 
      System.out.println(dataMap);
      for(GovSiteDetails details : convertedlist){
        dataMap.put(details.siteId , details);
      } 

      System.out.println("in GetsiteIndo, to prit datamap");
      System.out.println(dataMap);
      System.out.println(dataMap.get(2560).lat);
      Integer testSite = 2560;
      System.out.println(dataMap.get(testSite).lat);
    } else {
      System.out.println("GET request did not work");
    }
    return dataMap;
  }
}  