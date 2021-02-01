package com.google.sps.data;

public class GridCell {
  public double leftBound; // inclusive
  public double rightBound; // exclusive
  public double upperBound; // inclusive
  public double lowerBound; // exclusive
  private int numPoints;
  public double averageAQI;

  public GridCell(Coordinates upperLeft, Coordinates lowerRight) {
    this.leftBound = upperLeft.lng;
    this.rightBound = lowerRight.lng;
    this.upperBound = upperLeft.lat;
    this.lowerBound = lowerRight.lng;
    this.numPoints = 0;
    this.averageAQI = 0;
  }

  public void addPoint(AQDataPoint point) {
    // update the averageAQI, taking into account the number of points
    // already added to avoid bias towards the new point
    averageAQI = (averageAQI * numPoints + point.aqi) / (numPoints + 1);
    numPoints++;
  }
}