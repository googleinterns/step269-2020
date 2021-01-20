package com.google.sps.data;

public class AQDataPoint {
    private int lat;
    private int lng;
    private double aqi;
    private String siteName;
    public AQDataPoint() {}

    public AQDataPoint(int lat, int lng, double aqi, String siteName) {
        this.lat = lat;
        this.lng = lng;
        this.aqi = aqi;
        this.siteName = siteName;
    }
}