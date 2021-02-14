package com.google.sps.data;

public class GridCell {
  public double runningWeightedTotal;
  public double runningWeightSum;

  public GridCell() {
    this.runningWeightedTotal = 0;
    this.runningWeightSum = 0;
  }

  public void addPointWithWeight(AQDataPoint point, double weight) {
    if (point.aqi < 0) {
      return;
    }
    runningWeightedTotal += (point.aqi * weight);
    runningWeightSum += weight;
  }

  public double getAQI() {
    if (runningWeightSum <= 0 || runningWeightedTotal <= 0) {
      return -1;
    }
    return runningWeightedTotal / runningWeightSum;
  }
}