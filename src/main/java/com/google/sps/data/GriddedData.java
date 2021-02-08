package com.google.sps.data;

import java.util.HashMap;

/**
 * This class represents the AQI data grid used by the client for visualisation.
 * This grid is a linear approximation of the latitude and longitude, which may
 * be inaccurate due to the curvature of the earth
 */
public class GriddedData {
  public int aqDataPointsPerDegree; // The number of cells it takes to cover a degree of lng/lat
  public HashMap<Integer,HashMap<Integer,Double>> data;

  public GriddedData(int aqDataPointsPerDegree) {
    this.aqDataPointsPerDegree = aqDataPointsPerDegree;
    this.data = new HashMap<Integer,HashMap<Integer,Double>>();
  }

//   public GriddedData(GridCell[][] cells, int aqDataPointsPerDegree, Coordinates originCoords) {
//     int numRows = cells.length;
//     int numColumns = cells[0].length;
//     this.aqDataPointsPerDegree = aqDataPointsPerDegree;
//     this.origin = originCoords;
//     this.data = new HashMap<Integer,HashMap<Integer,Double>>();

//     for (int rowNum = 0; rowNum < cells.length; rowNum++) {
//       GridCell[] row = cells[rowNum];
//       for (int colNum = 0; colNum < row.length; colNum++) {
//         GridCell cell = row[colNum];
//         if (cell == null) {
//           // There were no data points for this cell
//           // An AQI of 0 will not be displayed by the visualisation layer
//           data[rowNum][colNum] = 0;
//         } else {
//           data[rowNum][colNum] = cell.averageAQI;
//         }
//       }
//     }
//   }
}