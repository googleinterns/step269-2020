/** A class, classified as an Adaptor. this is the Adaptor class for the government data source
 * the adaptors get their information from their respective data srouces - the government API is called here. 
*/

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

public class GovAdaptor {
  public static void main(final String[] args) {
    try {
      GovAdaptor.extract();
    } catch (final Exception e) {
      System.out.println(e.getMessage());
    }
  }

  public static void extract() throws Exception {
    //the POST url for API
    final URL url = new URL("https://data.airquality.nsw.gov.au/api/Data/get_Observations");
    final HttpURLConnection con = (HttpURLConnection) url.openConnection();
    con.setRequestMethod("POST");

    //Set "content-type" request header to "application/json" to send the request content in JSON form
    //Charset encoding as uT8 which is default, useful if the request enconding is diff to UT8 encoding
    con.setRequestProperty("Content-Type", "application/json; utf-8");

    //Set request header to application/json to read the response 
    con.setRequestProperty("Accept", "application/json");

    //Enable DoOutput to send requent content and write content to output stream
    con.setDoOutput(true);

    //Create the Request Body 
    final String jsonInputString = "{ \"Parameters\": [ \"AQI\", ], \"Sites\": [ ], \"StartDate\": \"2021-01-18\", \"EndDate\": \"2021-01-19\", \"Categories\": [ \"Site AQI\" ], \"SubCategories\": [ \"Hourly\" ], \"Frequency\": [ \"Hourly average\" ]}";

    //Output stream only flushes its output after its closed
    try(OutputStream os = con.getOutputStream()) {
    final byte[] input = jsonInputString.getBytes("utf-8");
    os.write(input, 0, input.length);
    }	

    //Read response from input stream 
    try(final BufferedReader br = new BufferedReader( new InputStreamReader(con.getInputStream(), "utf-8"))) {
      //String builder for String concatenation : append all the data in the while loop to the string builder 
      final StringBuilder response = new StringBuilder();
      String responseLine = null;
      while ((responseLine = br.readLine()) != null) {
        response.append(responseLine.trim());
      }
      //Add it to the responseString to now reflect a string that contains json formatted data in an array 
      String responseString = response.toString();

      // Convert String into an Arraylist of GovParameter class using Gson
      final Gson gson = new Gson();
      final ArrayList<GovParameters> convertedlist = gson.fromJson(responseString, new TypeToken<ArrayList<GovParameters>>() {}.getType());
    }
  }
}