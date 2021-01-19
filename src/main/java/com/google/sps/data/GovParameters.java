package com.google.sps.data;

import java.util.Arrays;
import java.util.List;

import com.google.gson.annotations.SerializedName;


/** A class, classified as Parameters */
public class GovParameters {
  @SerializedName(value = "Site_Id")
  private final int siteId;
  @SerializedName(value = "Value")
  private final double aqi; // AQI
  
  public GovParameters() {
    this.siteId = -1;
    this.aqi = -1;
  }

  public GovParameters(int siteId, double aqi) {
    this.siteId = siteId;
    this.aqi = aqi;
  }

  //overriding the toString() method  
  public String toString() {
    return siteId + " " + aqi;  
  }  
}