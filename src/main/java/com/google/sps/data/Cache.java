package com.google.sps.data;

import java.util.ArrayList;
import java.util.HashMap;

/**
 * This class coordinates retrieving information from the data sources needed by
 * the servlets. This includes filtering the data from the data sources into
 * only that needed by the servlet and collating the data from multiple sources.
 */
public class Cache {
  private HashMap<Integer,HashMap<Integer,GridCell>> dataGrid;

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
    int row = (int) Math.floor(targetCoords.lng + aqDataPointsPerDegree);
    int col = (int) Math.floor(targetCoords.lat + aqDataPointsPerDegree);
    return new GridIndex(col,row);
  }

  private GriddedData convertToGriddedData(HashMap<Integer,HashMap<Integer,GridCell>> data, int aqDataPointsPerDegree, Coordinates swCorner, Coordinates neCorner) {
    GriddedData grid = new GriddedData(aqDataPointsPerDegree);
    // work out the range of indices to prune to
    // should be easy unless the coords cross the 180 degree point, in which case the range between the indices are the ones that get pruned out
    GridIndex swIndex = getGridIndex(swCorner, aqDataPointsPerDegree);
    GridIndex neIndex = getGridIndex(neCorner, aqDataPointsPerDegree);

    for (HashMap.Entry<Integer, HashMap<Integer, GridCell>> entry : data.entrySet()) {
      continue;
    }
    return grid;
  }
}