package com.google.sps.data;

/**
 * This class represents the AQI data grid used by the client for visualisation.
 * This grid is a linear approximation of the latitude and longitude, which may
 * inaccurate due to the curvature of the earth
 */
public class GriddedData {
    public int resolution; // the width & height of each grid cell, stored in metres
    public double[][] data;

    // the coordinates of the top left corner of the grid
    public double originLat;
    public double originLng;

    public GriddedData(int numColumns, int numRows, int resolution, Coordinates originCoords) {
      this.resolution = resolution;
      this.originLat = originCoords.lat;
      this.originLng = originCoords.lng;
      this.data = new double[numRows][numColumns];
    }

    public GriddedData(GridCell[][] cells, int resolution, Coordinates originCoords) {
      int numRows = cells.length;
      int numColumns = cells[0].length;
      this.resolution = resolution;
      this.originLat = originCoords.lat;
      this.originLng = originCoords.lng;
      this.data = new double[numRows][numColumns];

      for (int rowNum = 0; rowNum < cells.length; rowNum ++) {
        GridCell[] row = cells[rowNum];
        for (int colNum = 0; colNum < row.length; colNum ++) {
          data[rowNum][colNum] = cells[rowNum][colNum].averageAQI;
        }
    }
    }
}