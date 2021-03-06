package com.google.sps.data;

import com.google.gson.annotations.SerializedName;

/** 
 * This class represents the coordinates of a site location.
 */
public class Coordinates {
  @SerializedName(value = "Longitude", alternate = {"longitude"})
  public double lng;

  @SerializedName(value = "Latitude", alternate = {"latitude"})
  public double lat;
  
  public Coordinates(double lng, double lat) {
    this.lng = lng;
    this.lat = lat;
  }  

  // No arg constructor to help differentiate a initialised class with invalid values.
  public Coordinates() {
    this.lng = -1;
    this.lat = -1;
  }

  @Override
  public String toString() {
    return "lng: " + lng + " lat: " + lat;  
  }  
}