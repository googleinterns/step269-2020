package com.google.sps.data;

import java.util.Arrays;
import java.util.List;

import com.google.gson.annotations.SerializedName;


/** A class, classified as Parameters */
public final class GovParameters {
  @SerializedName(value = "Site_Id")
  private final int siteId;
  @SerializedName(value = "Value")
  private final double aqi; // AQI

  public GovParameters(int siteId, double aqi) {
    this.siteId = siteId;
    this.aqi = aqi;
  }
}