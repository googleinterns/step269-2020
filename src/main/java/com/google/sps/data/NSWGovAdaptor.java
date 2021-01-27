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

/** File to run the GET request in java before putting it in the main adaptor function. 
 */
public class NSWGovAdaptor {

  private HashMap<Integer, GovSiteDetails> dataMap;

  public NSWGovAdaptor() throws Exception {
    this.dataMap = new HashMap<>();
    this.updateSiteInfo();
  }

  //to be deleted in production code, used for TestAdaptor.java
  public HashMap<Integer, GovSiteDetails> getMap(HashMap<Integer, GovSiteDetails> dataMap) {
    return this.dataMap;
  }

  public Coordinates getCoord(Integer siteId) {

    Coordinates siteCoord = new Coordinates(); 
    try {

      //Check if the siteId is in the map or not. If not, update the map first
      if (this.dataMap.containsKey(siteId) == false ) {
        this.updateSiteInfo();
      }
      
      siteCoord.setCoordinates(this.dataMap.get(siteId).lng, this.dataMap.get(siteId).lat);

    } catch (final NullPointerException e) {

      //indent continuation at least +4 from original line
      System.out.println("getCoord getMessage(): " + e.getMessage() + 
          "\nNull pointer exception caught, because null is returned as siteId Key is not in the hashmap" +
          "\nFailure to get coordinates. Default coord (-1,-1 ) is expected to be returned."); 

    } catch (final Exception e) {
      System.out.println("getCoord getMessage(): " + e.getMessage() + 
          "\nFailure to get coordinates. Default coord (-1,-1 ) is expected to be returned."); 
    } 

    //if siteId was found in map, it's locations coordinates will be returned
    //if siteId was not found in map, or any other errors were happened, (-1, -1) will be returned 
    return siteCoord;
  }


  public void updateSiteInfo() throws Exception {
    //creating a get request
    URL url = new URL("https://data.airquality.nsw.gov.au/api/Data/get_SiteDetails");
    HttpURLConnection connection = (HttpURLConnection) url.openConnection();
    connection.setRequestMethod("GET");
    
    connection.setRequestProperty("Content-Type", "application/json");
    
    int responseCode = connection.getResponseCode();

    ArrayList<GovSiteDetails> convertedlist = new ArrayList<GovSiteDetails>();
 
    try {
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

        //Convert the arrayList into a map. 
        for(GovSiteDetails details : convertedlist){
          dataMap.put(details.siteId , details);
        } 
      } else {

        //throw custom exception when the response code is not 200
        throw new HTTPStatusCodeException("HTTP Status Code is not 200");
      }
    } catch (final Exception e) {
      System.out.println("updateSiteInfo getMessage(): " + e.getMessage()); 
    }
  }

  //Post request to extract the AQI from the government API
  public ArrayList<NSWGovAQDataPoint> extractAQI() throws Exception {
    final URL url = new URL("https://data.airquality.nsw.gov.au/api/Data/get_Observations");
    final HttpURLConnection con = (HttpURLConnection) url.openConnection();
    con.setRequestMethod("POST");

    //Set "content-type" request header to "application/json" to send the request content in JSON form
    //Charset encoding as uT8 which is default, useful if the request enconding is diff to UT8 encoding
    con.setRequestProperty("Content-Type", "application/json; utf-8");

    //Set request header to application/json to read the response 
    con.setRequestProperty("Accept", "application/json");

    //Enable DoOutput to send request content and write content to output stream
    con.setDoOutput(true);

    //Create the Request Body 
    final String jsonInputString = "{" +
      "\"Parameters\": [ \"AQI\", ]," +
      "\"Sites\": [ ]," +
      "\"StartDate\": \"2021-01-18\"," +
      "\"EndDate\": \"2021-01-19\"," + 
      "\"Categories\": [ \"Site AQI\" ]," +
      "\"SubCategories\": [ \"Hourly\" ]," +
      "\"Frequency\": [ \"Hourly average\" ]" +
      "}";
 
    //Output stream only flushes its output after its closed
    try(OutputStream os = con.getOutputStream()) {
      final byte[] input = jsonInputString.getBytes("utf-8");
      os.write(input, 0, input.length);
    }	

    ArrayList<NSWGovAQDataPoint> convertedlist;
    //Read response from input stream 
    try(final BufferedReader br = new BufferedReader( new InputStreamReader(con.getInputStream(), "utf-8"))) {
      final StringBuilder response = new StringBuilder();
      String responseLine = null;
      while ((responseLine = br.readLine()) != null) {
        response.append(responseLine.trim());
      }
      
      //Add it to the responseString to now reflect a string that contains json formatted data in an array 
      final String responseString = response.toString();
      final Gson gson = new Gson();
      convertedlist = gson.fromJson(responseString, new TypeToken<ArrayList<NSWGovAQDataPoint>>() {}.getType());
    }
    return convertedlist;
  }
}  