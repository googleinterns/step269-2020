package com.google.sps.data;

import java.util.ArrayList;

/**
 * This class coordinates retrieving information from the data sources needed by
 * the servlets. This includes filtering the data from the data sources into
 * only that needed by the servlet and collating the data from multiple sources.
 */
public class Cache {
  private GriddedData dataGrid;

  public GriddedData getGrid(int zoomLevel, Coordinates swCorner, Coordinates neCorner) {
    ArrayList<AQDataPoint> data = new ArrayList<>();

    //catch the error here because the servlet cannot throw the Expection type
    try {
      data = getNSWGovData();
    } catch (Exception e) {
      System.out.println(e.getMessage());
      return dataGrid; //return the old grid
    }

    Coordinates nwCorner = new Coordinates(swCorner.lng, neCorner.lat);
    Coordinates seCorner = new Coordinates(neCorner.lng, swCorner.lat);
    int resolution = 1000;
    GridIndex lowerRightIndex = getGridIndex(nwCorner, seCorner, resolution);
    int gridWidth = lowerRightIndex.col + 1;
    int gridHeight = lowerRightIndex.row + 1;
    GridCell[][] processingGrid = new GridCell[gridWidth][gridHeight];

    for (AQDataPoint dataPoint : data) {
        GridIndex index = getGridIndex(nwCorner, new Coordinates(dataPoint.lng, dataPoint.lat),resolution);
        processingGrid[index.col][index.row].addPoint(dataPoint);
    }
    dataGrid = new GriddedData(processingGrid, resolution, nwCorner);
    return dataGrid;
  }

  private ArrayList<AQDataPoint> getNSWGovData() throws Exception {
    NSWGovAdaptor adaptor = new NSWGovAdaptor();
    return adaptor.getAQIData();
  }

  private GridIndex getGridIndex(Coordinates originCoords, Coordinates targetCoords, int resolution) {
    /*
    * Layout of coordinates:
    * originCoords -------------------- sameLngCoords
    *       |                                  |
    *       |                                  |
    *       |                                  |
    * sameLatCoords -------------------- targetCoords
    * 
    * Note: Due to the curvature of the earth, the actual shape bounded by the four
    * points may not be exactly rectangular, however it should be close enough
    * for small distances.
    */
    Coordinates sameLatCoords = new Coordinates(originCoords.lng,targetCoords.lat);
    Coordinates sameLngCoords = new Coordinates(targetCoords.lng,originCoords.lat);

    double latDistance = haversineDistance(originCoords, sameLngCoords);
    double lngDistance = haversineDistance(originCoords, sameLatCoords);

    int col = (int) Math.floor(latDistance/resolution);
    int row = (int) Math.floor(lngDistance/resolution);

    return new GridIndex(col,row);
  }

  private double haversineDistance(Coordinates point1, Coordinates point2) {
    final int R = 6371000; //Radius of earth in metres
    double rlat1 = Math.toRadians(point1.lat);
    double rlat2 = Math.toRadians(point2.lat);
    double difflat = rlat2-rlat1;
    double difflng = Math.toRadians(point2.lng-point1.lng);
    double a = Math.pow(Math.sin(difflat / 2.0), 2) + Math.cos(rlat1) * Math.cos(rlat2) * Math.pow(Math.sin(difflng / 2.0),2);
    double c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    double distance = R * c;
    return distance;
  }
}