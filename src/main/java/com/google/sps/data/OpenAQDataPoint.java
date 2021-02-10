package com.google.sps.data;

import java.util.ArrayList;

public class OpenAQDataPoint {
  public Coordinates coordinates;
  public ArrayList<OpenAQMeasurement> measurements;

  public AQDataPoint convertToAQDataPoint() {
    return null;
  }

  private double calcAQI(OpenAQMeasurement measurement) {
    // The approx midpoints of the thresholds defined at the following site for the AQ categories
    // https://soe.environment.gov.au/theme/ambient-air-quality/topic/2016/air-quality-index
    // this is not a very accurate calculation, however there is no accurate way since Australia
    // moved to reporting categories rather than AQI
    final int[] categoryAQIs = {17, 50, 83, 125, 160};
    int category = measurement.calcAQCategory();
    if (category == -1) {
      return -1;
    }
    return categoryAQIs[category-1];
  }
}
