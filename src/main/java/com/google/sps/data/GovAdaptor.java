package com.google.sps.data;

import java.io.BufferedReader;
import java.io.DataOutputStream;
import java.io.InputStreamReader;
import java.net.HttpURLConnection;
import java.net.URL;
import java.io.IOException;
import java.io.OutputStream;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;

import com.google.gson.Gson;
import com.google.gson.reflect.TypeToken;

/** Adaptor class for the government data source.
 * The adaptors get their information from their respective data sources - the government API is called here. 
 */
public class GovAdaptor {
  public static void main(final String[] args) {
    try {
      GovAdaptor.extract();
    } catch (final Exception e) {
      System.out.println(e.getMessage());
    }
  }
  public static ArrayList<NSWGovAQDataPoint> extract() throws Exception {
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