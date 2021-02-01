package com.google.sps.data;

import java.util.ArrayList;

/**
 * This class coordinates retrieving information from the data sources needed
 * by the servlets. This includes filtering the data from the data sources into
 * only that needed by the servlet and collating the data from multiple sources.
 */
public class Cache {
    private GriddedData dataGrid;
    
    public GriddedData getGrid(int zoomLevel, Coordinates swCorner, Coordinates neCorner) {
      System.out.println("retrieval of visualisation data not implemented yet");

      return dataGrid;
    }

    private ArrayList<AQDataPoint> getNSWGovData() throws Exception {
        NSWGovAdaptor adaptor = new NSWGovAdaptor();
        return adaptor.getAQIData();
    }
}