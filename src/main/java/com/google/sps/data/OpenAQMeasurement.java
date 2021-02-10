package com.google.sps.data;

import com.google.gson.annotations.SerializedName;

public class OpenAQMeasurement {
  @SerializedName(value = "parameter")
  public String name;
  public String unit;
  public double value;

  // The thresholds for each of the AQ categories as specified at
  // https://www.environment.nsw.gov.au/topics/air/understanding-air-quality-data/air-quality-categories
  // Some values have been rounded down to allow for integer storage
  private int[] o3Thresholds = {6, 10, 15, 20}; // pphm
  private int[] no2Thresholds = {8, 12, 18, 24}; // pphm
  private int[] so2Thresholds = {13, 20, 30, 40}; // pphm
  private int[] coThresholds = {6, 9, 15, 18}; // ppm
  private int[] pm10Thresholds = {50, 100, 200, 600}; // µg/m³
  private int[] pm25Thresholds = {25, 50, 100, 300}; // µg/m³

  /*
  * Calculates the AQ category as specified by
  * https://www.environment.nsw.gov.au/topics/air/understanding-air-quality-data/air-quality-categories
  * Note: the category names differ from above, instead the names from the following site are used:
  * https://soe.environment.gov.au/theme/ambient-air-quality/topic/2016/air-quality-index
  * The category is returned as a number 1-5 or -1:
  * -1: The either the conversion for the given unit or the parameter is not supported
  * 1: Very Good
  * 2: Good
  * 3: Fair
  * 4: Poor
  * 5: Very Poor
  */
  public int calcAQCategory() {
    switch (this.name) {
      case "o3":
        if (this.unit.equals("ppm")) {
          return getCategoryFromThresholds(this.value * 100, o3Thresholds);
        }
        return -1;
      case "no2":
        if (this.unit.equals("ppm")) {
          return getCategoryFromThresholds(this.value * 100, no2Thresholds);
        }
        return -1;
      case "so2":
        if (this.unit.equals("ppm")) {
          return getCategoryFromThresholds(this.value * 100, so2Thresholds);
        }
        return -1;
      case "co":
        if (this.unit.equals("ppm")) {
          return getCategoryFromThresholds(this.value, coThresholds);
        }
        return -1;
      case "pm10":
        if (this.unit.equals("µg/m³")) {
          return getCategoryFromThresholds(this.value, pm10Thresholds);
        }
        return -1;
      case "pm25":
        if (this.unit.equals("µg/m³")) {
          return getCategoryFromThresholds(this.value, pm25Thresholds);
        }
        return -1;
      }

    return -1;
  }

  private int getCategoryFromThresholds(double value, int[] thresholds) {
    for (int i = 0; i < thresholds.length; i++) {
      if (value < thresholds[i]) {
        return i + 1;
      }
    }
    return 5;
  }
}
