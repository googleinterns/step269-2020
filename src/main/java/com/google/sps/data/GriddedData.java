package com.google.sps.data;

/**
 * This class represents the AQI data grid used by the client for visualisation.
 * This grid is a linear approximation of the latitude and longitude, which may be
 * inaccurate due to the curvature of the earth
 */
public class GriddedData {
  public int resolution; // the width & height of each grid cell, stored in metres
  public double[][] data;

  // the coordinates of the top left corner of the grid
  public Coordinates origin;

  public GriddedData(int numColumns, int numRows, int resolution, Coordinates originCoords) {
    this.resolution = resolution;
    this.origin = originCoords;
    this.data = new double[numRows][numColumns];
  }

  public GriddedData(GridCell[][] cells, int resolution, Coordinates originCoords) {
    int numRows = cells.length;
    int numColumns = cells[0].length;
    this.resolution = resolution;
    this.origin = originCoords;
    this.data = new double[numRows][numColumns];

    for (int rowNum = 0; rowNum < cells.length; rowNum++) {
      GridCell[] row = cells[rowNum];
      for (int colNum = 0; colNum < row.length; colNum++) {
        GridCell cell = row[colNum];
        if (cell == null) {
          // There were no data points for this cell
          // An AQI of 0 will not be displayed by the visualisation layer
          data[rowNum][colNum] = 0;
        } else {
          data[rowNum][colNum] = cell.averageAQI;
        }
      }
    }
  }
}