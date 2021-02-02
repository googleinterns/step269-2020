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
}