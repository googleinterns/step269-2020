package com.google.sps.data;

import java.util.HashMap;
import java.util.Map;

import com.google.gson.annotations.SerializedName;

public class OpenAQMeasurement {
  @SerializedName(value = "parameter")
  public String name;
  public String unit;
  public double value;

  private HashMap<String, Double> australianMaxStandards = createStandardsMap();

  private HashMap<String, Double> createStandardsMap() {
    HashMap<String, Double> map = new HashMap<>();
    map.put("o3_ppm", 0.1);
    map.put("no2_ppm", 0.12);
    map.put("so2_ppm", 0.2);
    map.put("co_ppm", 9.0);
    map.put("pm10_µg/m³", 50.0);
    map.put("pm25_µg/m³", 25.0);
    return map;
  }

  // Calculate the AQI for this measurement based on Australian maximum standards
  public double calcMeasurementAQI() {
    String mapKey = this.name + "_" + this.unit;
    double standard = australianMaxStandards.getOrDefault(mapKey, -1.0);
    if (standard == -1) {
      return standard;
    }
    return (this.value / standard) * 100;
  }
}
