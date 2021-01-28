package com.google.sps.data;

import com.google.gson.annotations.SerializedName;

/** 
 * This class represents the site details provided by NSW GOV API for each site avaialble for fitering. A PDS. 
 */
public class GovSiteDetails {
  @SerializedName(value = "Site_Id")
  public int siteId;

  @SerializedName(value = "SiteName")
  public String siteName;

  @SerializedName(value = "Longitude")
  public double lng;

  @SerializedName(value = "Latitude")
  public double lat;

  //No arg constructor to help differentiate a initialised class with invalid values.
  public GovSiteDetails() {
    this.siteId = -1;
    this.siteName = "Uninitialised site name"; 
    this.lng = -1;
    this.lat = -1;
  }

  @Override
  public String toString() {
    return siteId + " " + siteName + " " + lng + " " + lat;  
  }  
}
