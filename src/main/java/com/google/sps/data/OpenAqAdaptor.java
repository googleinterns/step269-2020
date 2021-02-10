package com.google.sps.data;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.net.HttpURLConnection;
import java.net.URL;
import java.util.ArrayList;

import com.google.gson.Gson;
import com.google.gson.reflect.TypeToken;

public class OpenAQAdaptor {
  public ArrayList<AQDataPoint> getAQIData() throws Exception {
    // get data from get request, convert it to [OpenAQDataPoint]
    // calculate the aqi for each point
    //    calc AQC for each param
    //    use max AQC to get AQI - midpoint/max of range?
    // use calculated aqi to create an AQDataPoint
    // return list of AQDataPoints

    ArrayList<OpenAQDataPoint> rawData = fetchRawData();
    ArrayList<AQDataPoint> data = convertToAQDataPoints(rawData);
    return data;
  }

  private ArrayList<OpenAQDataPoint> fetchRawData() throws Exception {
    URL url = new URL("https://docs.openaq.org/v2/latest?limit=1000&page=1&offset=0&sort=desc&radius=1000&country_id=au&order_by=lastUpdated&dumpRaw=false");
    HttpURLConnection connection = (HttpURLConnection) url.openConnection();
    connection.setRequestMethod("GET");
    connection.setRequestProperty("Content-Type", "application/json");

    int responseCode = connection.getResponseCode();
    ArrayList<OpenAQDataPoint> data = new ArrayList<>();

    try {
      if (responseCode == HttpURLConnection.HTTP_OK) {
        BufferedReader br = new BufferedReader(new InputStreamReader(connection.getInputStream()));
        StringBuilder response = new StringBuilder();
        String responseLine;
        while ((responseLine = br.readLine()) != null) {
          response.append(responseLine.trim());
        }

        String responseString = response.toString();
        System.out.println(responseString); // TODO
        Gson gson = new Gson();
        data = gson.fromJson(responseString, new TypeToken<ArrayList<OpenAQDataPoint>>() {}.getType());
      }
    } catch (final Exception e) {
      System.out.println("Error in OpenAQAdaptor.fetchRawData(): " + e.getMessage());
    }

    return data;
  }

  private ArrayList<AQDataPoint> convertToAQDataPoints(ArrayList<OpenAQDataPoint> rawData) {
    ArrayList<AQDataPoint> convertedData = new ArrayList<>();
    for (OpenAQDataPoint dataPoint : rawData) {
      convertedData.add(dataPoint.convertToAQDataPoint());
    }
    return convertedData;
  }
}
