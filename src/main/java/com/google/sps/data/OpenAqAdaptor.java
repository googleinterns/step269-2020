package com.google.sps.data;

import java.util.ArrayList;

public class OpenAQAdaptor {
  private ArrayList<AQDataPoint> getAQIData() {
    // get data from get request
    // calculate the aqi for each point
    //    calc AQC for each param
    //    use max AQC to get AQI - midpoint/max of range?
    // use calculated aqi to create an AQDataPoint
    // return list of AQDataPoints
    ArrayList<AQDataPoint> data = new ArrayList<>();
    return data;
  }
}
