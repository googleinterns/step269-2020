package com.google.sps.data;

/**
 * This class represents the unified data format for AQ data passed to the client.
 */
public class AQDataPoint {
  private double lat;
  private double lng;
  private double aqi;
  private String siteName;

  public AQDataPoint() {}

  public void setLat(double lat) {
    this.lat = lat;
  }

  public void setLng(double lng) {
    this.lng = lng;
  }

  public void setAQI(double AQI) {
    this.aqi = AQI;
  }

  public void setName(String name) {
    this.siteName = name;
  }

  @Override
  public String toString() {
    return "lng: " + lng + " lat: " + lat + " aqi: " + aqi + " name: " + siteName;  
  }  
}