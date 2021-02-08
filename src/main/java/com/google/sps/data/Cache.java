package com.google.sps.data;

import java.util.ArrayList;
import java.util.HashMap;

/**
 * This class coordinates retrieving information from the data sources needed by
 * the servlets. This includes filtering the data from the data sources into
 * only that needed by the servlet and collating the data from multiple sources.
 */
public class Cache {
  private HashMap<Integer,HashMap<Integer,GridCell>> dataGrid = new HashMap<>();
  private int aqDataPointsPerDegree;

  public GriddedData getGrid(Coordinates swCorner, Coordinates neCorner) {
    ArrayList<AQDataPoint> data = new ArrayList<>();
    aqDataPointsPerDegree = 1000;

    // Catch the error here because the servlet cannot throw the Exception type
    try {
      data = getNSWGovData();
    } catch (Exception e) {
      System.out.println(e.getMessage());
      return convertToGriddedData(swCorner, neCorner); // return the old grid
    }
    
    for (AQDataPoint dataPoint : data) {
      GridIndex index = getGridIndex(new Coordinates(dataPoint.lng, dataPoint.lat));
      HashMap<Integer,GridCell> row = dataGrid.getOrDefault(index.row, new HashMap<>());
      GridCell cell = row.getOrDefault(index.col, new GridCell());
      cell.addPoint(dataPoint);
      row.put(index.col, cell);
      dataGrid.put(index.row, row);
    }

    return convertToGriddedData(swCorner, neCorner);
  }

  private ArrayList<AQDataPoint> getNSWGovData() throws Exception {
    NSWGovAdaptor adaptor = new NSWGovAdaptor();
    return adaptor.getAQIData();
  }

  private GridIndex getGridIndex(Coordinates targetCoords) {
    int row = (int) (targetCoords.lat * this.aqDataPointsPerDegree);
    int col = (int) (targetCoords.lng * this.aqDataPointsPerDegree);
    return new GridIndex(col,row);
  }

  // Note: this function does not support viewports that cross the 180 degree latitude or the poles
  private GriddedData convertToGriddedData(Coordinates swCorner, Coordinates neCorner) {
    GriddedData grid = new GriddedData(this.aqDataPointsPerDegree);
    GridIndex swIndex = getGridIndex(swCorner);
    GridIndex neIndex = getGridIndex(neCorner);

    for (HashMap.Entry<Integer, HashMap<Integer, GridCell>> rowEntry : this.dataGrid.entrySet()) {
      HashMap<Integer, Double> convertedRow = new HashMap<>();

      int rowNum = rowEntry.getKey();
      if (rowNum > neIndex.row || rowNum < swIndex.row) {
        continue;
      }
      HashMap<Integer, GridCell> row = rowEntry.getValue();
      for (HashMap.Entry<Integer, GridCell> cellEntry : row.entrySet()) {
        int colNum = cellEntry.getKey();
        if (colNum > neIndex.col || colNum < swIndex.col) {
          continue;
        }
        GridCell cell = cellEntry.getValue();
        convertedRow.put(colNum,cell.averageAQI);
      }
      if (!convertedRow.isEmpty()) {
        grid.data.put(rowNum, convertedRow);
      }
    }
    return grid;
  }
}