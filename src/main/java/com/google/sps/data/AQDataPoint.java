package com.google.sps.data;

/**
 * This class represents the unified data format for AQ data passed to the client.
 */
public class AQDataPoint {
  public double lat;
  public double lng;
  public double aqi;
  public String siteName;

  public AQDataPoint() {}

  @Override
  public String toString() {
    return "lng: " + lng + " lat: " + lat + " aqi: " + aqi + " name: " + siteName;  
  }  
}