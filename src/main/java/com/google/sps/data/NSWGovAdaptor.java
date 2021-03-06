package com.google.sps.data;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.net.HttpURLConnection;
import java.net.URL;
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

  /**
   * Manages the entire process of getting data from the NSW Gov API,
   * from fetching the data to collating it into the unified AQDataPoint format.
   * @return the AQI data for the current date with duplicate elements removed
   * @throws Exception
   */
  public ArrayList<AQDataPoint> getAQIData() throws Exception {
    LocalDate currentDate = LocalDate.now();
    ArrayList<AQDataPoint> dataWithDupes = this.convertAllDataPoints(extractAQI(currentDate));
    return this.removeAlternateElements(dataWithDupes);
  }

  private AQDataPoint convertDataPoint(NSWGovAQDataPoint givenPoint) {
    // Take the site id from given NSWGovAQDataPoint and fetch coordinates from map.
    int pointSiteid = givenPoint.siteId;
    GovSiteDetails pointSiteDetails = this.dataMap.get(pointSiteid);

    // Fill all data into AQdatapoint.
    AQDataPoint siteDataPoint = new AQDataPoint(pointSiteDetails.siteName, givenPoint.aqi, pointSiteDetails.lat, pointSiteDetails.lng);
    return siteDataPoint;
  }

  /**
   * Wrapper function to convert all elements of a given NSWGovAQDataPoint ArrayList 
   * into an ArrayList of AQDataPoints, which will be the common class for AQ Data. 
   */
  private ArrayList<AQDataPoint> convertAllDataPoints(ArrayList<NSWGovAQDataPoint> govDataPointList) {
    ArrayList<AQDataPoint> convertedAQDataList = new ArrayList<AQDataPoint>();
    try {
      if (govDataPointList.isEmpty()) {
        throw new EmptyListException("Exception: Given List is empty");
      }
      for (NSWGovAQDataPoint indvGovAQPoint : govDataPointList) {
        convertedAQDataList.add(convertDataPoint(indvGovAQPoint));
      }
    } catch (final Exception e) {
      System.out.println("convertAllDataPoints getMessage(): " + e.getMessage()); 
    }
    return convertedAQDataList;
  }

  private ArrayList<AQDataPoint> removeAlternateElements(ArrayList<AQDataPoint> repeatingConvertedDataList) {
    // The given list contains both the AQI and the AQI on a rolling 24 hr basis. 
    // Filter out every second element in the given list so the new returned list only has the AQI once. 
    ArrayList<AQDataPoint> noDupeAQDataList = new ArrayList<AQDataPoint>();
    try {
      if (repeatingConvertedDataList.isEmpty()) {
        throw new EmptyListException("Exception: Given List is empty");
      }
      for (int i = 0; i < repeatingConvertedDataList.size(); i += 2) {
        noDupeAQDataList.add(repeatingConvertedDataList.get(i));
      }
    } catch (final Exception e) {
      System.out.println("removeAlternateElements getMessage(): " + e.getMessage()); 
    }
    return noDupeAQDataList;
  }

  private Coordinates getCoord(Integer siteId) {
    Coordinates siteCoord = new Coordinates(); 

    try {
      // Check if the siteId is in the map or not. If not, update the map first.
      if (this.dataMap.containsKey(siteId) == false ) {
        this.updateSiteInfo();
      }

      GovSiteDetails pointSiteDetails = this.dataMap.get(siteId);
      siteCoord.lat = pointSiteDetails.lat;
      siteCoord.lng = pointSiteDetails.lng;
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

  private void updateSiteInfo() throws Exception {
    // Creating a get request.
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
   * due to a bad implementation of the filtering in the NSWGov Data API, add more filtering.
   */
  private ArrayList<NSWGovAQDataPoint> extractAQI(LocalDate inputDate) throws Exception {
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