package com.google.sps.data;

import java.util.Arrays;
import java.util.List;

import com.google.gson.annotations.SerializedName;

/** 
 * This class represents the site details provided by NSW GOV API for each site avaialble for fitering.
 */
public class SiteDetails {
  @SerializedName(value = "Site_Id")
  private final int siteId;

  @SerializedName(value = "SiteName")
  private final String siteName;

  @SerializedName(value = "Longitude")
  private final double lng;

  @SerializedName(value = "Latitude")
  private final double lat;

  @SerializedName(value = "Region")
  private final String reg;    

  //No arg constructor to help differentiate a initialised class with invalid values 
  public SiteDetails() {
    this.siteId = -1;
    this.siteName = "Uninitialised site name"; 
    this.lng = -1;
    this.lat = -1;
    this.reg = "Uninitialised regio";

  }

  public SiteDetails(int siteId, String siteName, double lng, double lat, String reg) {
    this.siteId = siteId;
    this.siteName = siteName; 
    this.lng = lng;
    this.lat = lat;
    this.reg = reg;
  }
}