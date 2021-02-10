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
      data.addAll(getNSWGovData());
    } catch (Exception e) {
      System.out.println(e.getMessage());
    }

    try {
      data.addAll(getOpenAQData());
    } catch (Exception e) {
      System.out.println(e.getMessage());
    }
    
    dataGrid = new HashMap<>();

    for (AQDataPoint dataPoint : data) {
      GridIndex index = getGridIndex(new Coordinates(dataPoint.lng, dataPoint.lat));
      addDataPointWithWeighting(dataPoint, 5, index);
    }

    return convertToGriddedData(swCorner, neCorner);
  }

  private void addDataPointWithWeighting(AQDataPoint dataPoint, int numRings, GridIndex centreCellIndex) {
    int centreRow = centreCellIndex.row;
    int centreCol = centreCellIndex.col;
    for (int ring = numRings -1; ring >= 0; ring--) {
      for (int rowNum = centreRow - ring; rowNum <= centreRow + ring; rowNum ++) {
        HashMap<Integer, GridCell> row = dataGrid.getOrDefault(rowNum, new HashMap<>());
        for (int colNum = centreCol - ring; colNum <= centreCol + ring; colNum ++) {
          GridCell cell = row.getOrDefault(colNum, new GridCell());
          cell.addPoint(dataPoint);
          row.put(colNum,cell);
        }
        dataGrid.put(rowNum,row);
      }
    }
  }

  private ArrayList<AQDataPoint> getNSWGovData() throws Exception {
    NSWGovAdaptor adaptor = new NSWGovAdaptor();
    return adaptor.getAQIData();
  }

  private ArrayList<AQDataPoint> getOpenAQData() throws Exception {
    OpenAQAdaptor adaptor = new OpenAQAdaptor();
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

    for (int rowNum = swIndex.row; rowNum <= neIndex.row; rowNum++) {
      HashMap<Integer, Double> convertedRow = new HashMap<>();
      HashMap<Integer, GridCell> row = this.dataGrid.get(rowNum);
      if (row == null) {
        continue;
      }
      for (int colNum = swIndex.col; colNum <= neIndex.col; colNum++) {
        GridCell cell = row.get(colNum);
        if (cell == null) {
          continue;
        }
        convertedRow.put(colNum, cell.averageAQI);
      }
      if (!convertedRow.isEmpty()) {
        grid.data.put(rowNum, convertedRow);
      }
    }
    return grid;
  }
}