/** A class, classified as an Adaptor. this is the Adaptor class for the government data source
 * this is like class declaration 
 * i call the government api in here 
 * the job of the servlet is take the request form the client side  - they talk to the adapator and get the info
 * the serlvet gets info from all the adaptirs
 * the adaptors get their info from their respective data srouces 
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

//there'll be methods 
//fetching from api here so from gov api
//WANT A STATIC METHOD  

public class GovAdaptor {
  public static void main(final String[] args) {
    try {
      GovAdaptor.extract();
    } catch (final Exception e) {
      System.out.println(e.getMessage());
    }
  }

  public static void extract() throws Exception {
    //url for api, this is the POST url
    final URL url = new URL("https://data.airquality.nsw.gov.au/api/Data/get_Observations");
    final HttpURLConnection con = (HttpURLConnection) url.openConnection();
    con.setRequestMethod("POST");

    //Set "content-type" request header to "application/json" to send the request content in JSON form
    //Charset encoding as uT8 which is default, useful if the request enconding is diff to UT8 encoding
    con.setRequestProperty("Content-Type", "application/json; utf-8");

    //Set request header to application/json to read the response 
    con.setRequestProperty("Accept", "application/json");

    //to send request content - enable dout porperty to true or else we cant write content to the output stream
    //sneding in the data i want to get out - write data to the connection
    con.setDoOutput(true);

    //Creating the Request Body
    //Json string to be constructred for sepcifc resource(?) - a sample string rn 
    final String jsonInputString = "{ \"Parameters\": [ \"AQI\" ], \"Sites\": [ 336, 4330, 2330, 7330, 3330, 329, 5330 ], \"StartDate\": \"2021-01-13\", \"EndDate\": \"2021-01-14\", \"Categories\": [ \"Site AQI\" ], \"SubCategories\": [ \"Hourly\" ], \"Frequency\": [ \"Hourly average\" ]}";

    //output stream only flushes its output after its closed
    try(OutputStream os = con.getOutputStream()) {
    final byte[] input = jsonInputString.getBytes("utf-8");
    os.write(input, 0, input.length);
    }	

    //read response from input stream 
    try(final BufferedReader br = new BufferedReader( new InputStreamReader(con.getInputStream(), "utf-8"))) {
      //string builder: put stuff into it, all that stuff i gave, give it back to me as one big string
      final StringBuilder response = new StringBuilder();
      String responseLine = null;
      while ((responseLine = br.readLine()) != null) {
        response.append(responseLine.trim());
      }
      //add it to the responseString. it shows an array of the data
      String responseString = response.toString();
      //System.out.println(responseString);

      //String jsonToProcess = "{'Site_Id':329,'Parameter':{'ParameterCode':'AQI','ParameterDescription':'AQI','Units':'index','UnitsDescription':'index','Category':'Site AQI','SubCategory':'Hourly','Frequency':'Hourly average'},'Date':'2021-01-13','Hour':1,'HourDescription':'12 am - 1 am','Value':41}"


      // now to take a string(which contains some json formatted data) into gson
      final Gson gson = new Gson();
      //converting the json string into a array list ( a list of the govparameter class)
      final ArrayList<GovParameters> convertedlist = gson.fromJson(responseString, new TypeToken<ArrayList<GovParameters>>() {}.getType());
      //convertedlist.forEach(x -> System.out.println(x));
      System.out.println(convertedlist);
    }

    //hypotechnical that this converst into a string, make it now into a json object like array list  (might need to define a class to convert the json into e.g. like comments class). using gson hopefully 
    //You'll need to look at the response and match the class variables to the json fields
    //Sort of like a hashmap
    // make pr 

    //write a separeat program and use gson to work on string 

    //want to convert "response, so what i get from the terminal  into a string 
    //then convert into a json object e.g. arraylist   (using gson)
    // then cache 
    // then make servlet, which uses gson to pass into string 
  }
}
