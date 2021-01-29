package com.google.sps.data;

import java.io.BufferedReader;
import java.io.DataOutputStream;
import java.io.InputStreamReader;
import java.net.HttpURLConnection;
import java.net.URL;
import java.io.IOException;
import java.io.OutputStream;
import java.util.ArrayList;
import java.util.HashMap;
import java.time.*; 
import java.time.format.DateTimeFormatter;

import com.google.gson.Gson;
import com.google.gson.reflect.TypeToken;

/** 
 * File to run the GET request in java before putting it in the main adaptor function. 
 */
public class NSWGovAdaptor {

  private HashMap<Integer, GovSiteDetails> dataMap;

  public NSWGovAdaptor() throws Exception {
    this.dataMap = new HashMap<>();
    this.updateSiteInfo();
  }

  // To be deleted in production code, used for TestAdaptor.java.
  public HashMap<Integer, GovSiteDetails> getMap() {
    return this.dataMap;
  }

  public AQDataPoint convertDataPoint(NSWGovAQDataPoint givenPoint) { 
    /*
    individual data point conversion to Aqdatapoint
    Individual one takes in neswdatapoint 
    Extract method - create a list of nswaqdatapoint 
    Which has a site id and a aqi
    Call converter, give a nswaqdata point
    It takes the site id from the data point which will be problems ose its private
    Pass the side id into the get coord
    Take the aqi data from the og data copy it to the common data point
    And the lng lat to the cpmmpn data point  to return
    So the parameter it needs is a aqnswdata point
    */
    //for each data point, if the value is -1, continue to the next data point so you get a data strema of hours,
    // each hours is duped, but the ordering is consistent

    //take the site id from given data point and pass it into get coord which gives the coord 
    int pointSiteid = givenPoint.getId();

    //take our aqi data from given NSWGovAQDataPoint
    double pointAQI = givenPoint.getAQI();

    //get sitenane fron govesitedetails
    String pointName = this.dataMap.get(pointSiteid).siteName;
    double pointLat = this.dataMap.get(pointSiteid).lat;
    double pointLng = this.dataMap.get(pointSiteid).lng;

    //put all data into AQdatapoint
    AQDataPoint siteDataPoint = new AQDataPoint();
    siteDataPoint.setLat(pointLat);
    siteDataPoint.setLng(pointLng);
    siteDataPoint.setName(pointName);
    siteDataPoint.setAQI(pointAQI);
    
    return siteDataPoint;
  }

  public Coordinates getCoord(Integer siteId) {
    Coordinates siteCoord = new Coordinates(); 

    try {
      // Check if the siteId is in the map or not. If not, update the map first.
      if (this.dataMap.containsKey(siteId) == false ) {
        this.updateSiteInfo();
      }

      siteCoord.setCoordinates(this.dataMap.get(siteId).lng, this.dataMap.get(siteId).lat);
    } catch (final NullPointerException e) {
      System.out.println("getCoord getMessage(): " + e.getMessage() + 
          "\nNull pointer exception caught, because null is returned as siteId Key is not in the hashmap" +
          "\nFailure to get coordinates. Default coord (-1,-1 ) is expected to be returned."); 
    } catch (final Exception e) {
      System.out.println("getCoord getMessage(): " + e.getMessage() + 
          "\nFailure to get coordinates. Default coord (-1,-1 ) is expected to be returned."); 
    } 

    // If siteId was found in map, it's locations coordinates will be returned.
    // If siteId was not found in map, or any other errors were happened, (-1, -1) will be returned.
    return siteCoord;
  }

  public void updateSiteInfo() throws Exception {
    // Creating a get request.
    URL url = new URL("https://data.airquality.nsw.gov.au/api/Data/get_SiteDetails");
    HttpURLConnection connection = (HttpURLConnection) url.openConnection();
    connection.setRequestMethod("GET");
    connection.setRequestProperty("Content-Type", "application/json");

    int responseCode = connection.getResponseCode();
    ArrayList<GovSiteDetails> convertedlist = new ArrayList<GovSiteDetails>();
    System.out.println(java.time.LocalDate.now());  

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

        // Convert the arrayList into a map. 
        for(GovSiteDetails details : convertedlist){
          dataMap.put(details.siteId , details);
        } 
      } else {
        // Throw custom exception when the response code is not 200.
        throw new HTTPStatusCodeException("HTTP Status Code is not 200");
      }
    } catch (final Exception e) {
      System.out.println("updateSiteInfo getMessage(): " + e.getMessage()); 
    }
  }


  /**
   * Post request to extract the AQI from the government API, given a desired date.
   * TODO(rosanna): This currently reports each data point twice, 
   *  due to a bad implementation of the filtering in the NSWGov Data API, add more filtering.
   */
  public ArrayList<NSWGovAQDataPoint> extractAQI(LocalDate inputDate) throws Exception {
    final URL url = new URL("https://data.airquality.nsw.gov.au/api/Data/get_Observations");
    final HttpURLConnection con = (HttpURLConnection) url.openConnection();
    con.setRequestMethod("POST");

    // Set "content-type" request header to "application/json" to send the request content in JSON form.
    // Charset encoding as UTF8 which is default, useful if the request enconding is diff to UTF8 encoding.
    con.setRequestProperty("Content-Type", "application/json; utf-8");

    // Set request header to application/json to read the response.
    con.setRequestProperty("Accept", "application/json");

    // Enable DoOutput to send request content and write content to output stream.
    con.setDoOutput(true);

    String desiredDate = inputDate.format(DateTimeFormatter.ofPattern("yyyy-MM-dd"));

    // Create the Request Body.
    final String jsonInputString = "{" +
      "\"Parameters\": [ \"AQI\", ]," +
      "\"Sites\": [ ]," +
      String.format("\"StartDate\": \"%s\",", desiredDate) +
      String.format("\"EndDate\": \"%s\",", desiredDate) + 
      "\"Categories\": [ \"Site AQI\" ]," +
      "\"SubCategories\": [ \"Hourly\" ]," +
      "\"Frequency\": [ \"Hourly average\" ]" +
      "}";
 
    // Output stream only flushes its output after its closed.
    try(OutputStream os = con.getOutputStream()) {
      final byte[] input = jsonInputString.getBytes("utf-8");
      os.write(input, 0, input.length);
    }	

    // Read response from input stream into an array.
    ArrayList<NSWGovAQDataPoint> convertedlist = new ArrayList<NSWGovAQDataPoint>();
    try(final BufferedReader br = new BufferedReader( new InputStreamReader(con.getInputStream(), "utf-8"))) {
      final StringBuilder response = new StringBuilder();
      String responseLine = null;
      while ((responseLine = br.readLine()) != null) {
        response.append(responseLine.trim());
      }
      
      // Add it to the responseString to now reflect a string that contains json formatted data in an array.
      final String responseString = response.toString();
      final Gson gson = new Gson();
      convertedlist = gson.fromJson(responseString, new TypeToken<ArrayList<NSWGovAQDataPoint>>() {}.getType());
    } catch (final Exception e) {
      System.out.println("GovPostReq getMessage(): " + e.getMessage()); 
    }
    return convertedlist;
  }
}  