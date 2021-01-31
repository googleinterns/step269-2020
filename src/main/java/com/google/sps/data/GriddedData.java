package com.google.sps.data;

/**
 * This class represents the AQI data grid used by the client for visualisation
 */
public class GriddedData {
    public int resolution; // the width & height of each grid cell, stored in metres
    public double[][] data;
    public Coordinates origin; // the coordinates of the top left corner of the grid
}