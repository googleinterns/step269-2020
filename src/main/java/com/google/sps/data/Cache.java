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

  public GriddedData getGrid(Coordinates swCorner, Coordinates neCorner) {
    ArrayList<AQDataPoint> data = new ArrayList<>();
    final int aqDataPointsPerDegree = 1000;

    // Catch the error here because the servlet cannot throw the Exception type
    try {
      data = getNSWGovData();
    } catch (Exception e) {
      System.out.println(e.getMessage());
      return convertToGriddedData(dataGrid, aqDataPointsPerDegree, swCorner, neCorner); // return the old grid
    }
    
    for (AQDataPoint dataPoint : data) {
      GridIndex index = getGridIndex(new Coordinates(dataPoint.lng, dataPoint.lat), aqDataPointsPerDegree);
      HashMap<Integer,GridCell> row = dataGrid.getOrDefault(index.row, new HashMap<>());
      GridCell cell = row.getOrDefault(index.col, new GridCell());
      cell.addPoint(dataPoint);
      row.put(index.col, cell);
      dataGrid.put(index.row, row);
    }

    return convertToGriddedData(dataGrid, aqDataPointsPerDegree, swCorner, neCorner);
  }

  private ArrayList<AQDataPoint> getNSWGovData() throws Exception {
    NSWGovAdaptor adaptor = new NSWGovAdaptor();
    return adaptor.getAQIData();
  }

  private GridIndex getGridIndex(Coordinates targetCoords, int aqDataPointsPerDegree) {
    int row = (int) Math.floor(targetCoords.lat * aqDataPointsPerDegree);
    int col = (int) Math.floor(targetCoords.lng * aqDataPointsPerDegree);
    return new GridIndex(col,row);
  }

  // TODO (Rachel): add check for bounds crossing 180 degree boundary (not needed for NSW data)
  private GriddedData convertToGriddedData(HashMap<Integer,HashMap<Integer,GridCell>> data, int aqDataPointsPerDegree, Coordinates swCorner, Coordinates neCorner) {
    GriddedData grid = new GriddedData(aqDataPointsPerDegree);
    GridIndex swIndex = getGridIndex(swCorner, aqDataPointsPerDegree);
    GridIndex neIndex = getGridIndex(neCorner, aqDataPointsPerDegree);
    for (HashMap.Entry<Integer, HashMap<Integer, GridCell>> rowEntry : data.entrySet()) {
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