package com.google.sps.data;

public class GridCell {
  private int numPoints;
  public double averageAQI;

  public GridCell() {
    this.numPoints = 0;
    this.averageAQI = 0;
  }
  /**
   * Update the averageAQI, taking into account the number of points
   * already added to avoid creating bias towards the new point
   */
  public void addPoint(AQDataPoint point) {
    if (point.aqi < 0) {
        return;
    }
    averageAQI = (averageAQI * numPoints + point.aqi) / (numPoints + 1);
    numPoints ++;
  }

  /**
   * Update the averageAQI, taking into account a weighting to bias the point more or less
   * The higher the weight, the more bias there is towards that point.
   * The weight must be a non-negative integer for the function to work as expected
   */
  public void addPoint(AQDataPoint point, int weight) {
    if (point.aqi < 0) {
      return;
    }
    averageAQI = (averageAQI * numPoints + point.aqi * weight) / (numPoints + weight);
    numPoints += weight;
  }
}