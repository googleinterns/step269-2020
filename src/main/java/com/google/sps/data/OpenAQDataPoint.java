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
    // The approx midpoints of the thresholds defined at the following site for the AQ categories
    // https://soe.environment.gov.au/theme/ambient-air-quality/topic/2016/air-quality-index
    // this is not a very accurate calculation, however there is no accurate way since Australia
    // moved to reporting categories rather than AQI
    final int[] categoryAQIs = {17, 50, 83, 125, 160};

    int maxCategory = -1;
    for (OpenAQMeasurement measurement : measurements) {
      int category = measurement.calcAQCategory();
      maxCategory = category > maxCategory ? category : maxCategory;
    }

    return categoryAQIs[maxCategory - 1];
  }
}
