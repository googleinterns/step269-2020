package com.google.sps.data;

import java.util.Arrays;
import java.util.List;

import com.google.gson.annotations.SerializedName;

/** A class, classified as NSWGovAQDataPoint */
public class NSWGovAQDataPoint {
  @SerializedName(value = "Site_Id")
  private final int siteId;
  @SerializedName(value = "Value")
  private final double aqi; 
  
  //No arg constructor to help differentiate a initialised class with invalid values 
  public NSWGovAQDataPoint() {
    this.siteId = -1;
    this.aqi = -1;
  }

  @Override
  public String toString() {
    return siteId + " " + aqi;  
  }  
}