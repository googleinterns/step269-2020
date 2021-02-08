package com.google.sps.data;

import java.util.HashMap;

/**
 * This class represents the AQI data grid used by the client for visualisation.
 */
public class GriddedData {
  public int aqDataPointsPerDegree; // The number of cells it takes to cover a degree of lng/lat
  public HashMap<Integer, HashMap<Integer, Double>> data;

  public GriddedData(int aqDataPointsPerDegree) {
    this.aqDataPointsPerDegree = aqDataPointsPerDegree;
    this.data = new HashMap<Integer, HashMap<Integer, Double>>();
  }
}