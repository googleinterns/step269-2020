package com.google.sps.data;

import java.util.ArrayList;

public class OpenAQDataPoint {
  public String location;
  public Coordinates coordinates;
  public ArrayList<OpenAQMeasurement> measurements;

  public AQDataPoint convertToAQDataPoint() {
    double aqi = this.calcAQI(measurements);
    AQDataPoint convertedPoint = new AQDataPoint(location, aqi, coordinates.lat, coordinates.lng);
    return convertedPoint;
  }

  private double calcAQI(ArrayList<OpenAQMeasurement> measurements) {
    double maxAQI = -1;
    for (OpenAQMeasurement measurement : measurements) {
      double aqi = measurement.calcMeasurementAQI();
      maxAQI = aqi > maxAQI ? aqi : maxAQI;
    }
    return maxAQI;
  }
}
