package com.google.sps.data;

/**
 * This class represents the unified data format for AQ data passed to the client.
 */
public class AQDataPoint {
    private int lat;
    private int lng;
    private double aqi;
    private String siteName;

    public AQDataPoint() {}
}