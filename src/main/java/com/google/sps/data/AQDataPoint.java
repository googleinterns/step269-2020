package com.google.sps.data;

/**
 * This class represents the unified data format for AQ data passed to the client.
 */
public class AQDataPoint {
  public String siteName;
  public double aqi;
  public double lat;
  public double lng;

  public AQDataPoint(String siteName, double aqi, double lat, double lng) {
    this.siteName = siteName;
    this.aqi = aqi;
    this.lat = lat;
    this.lng = lng;
  }
  @Override
  public String toString() {
    return "lng: " + lng + " lat: " + lat + " aqi: " + aqi + " name: " + siteName;  
  }  
}