package com.google.sps.servlets;

import java.io.IOException;

import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.google.sps.data.Cache;
import com.google.sps.data.Coordinates;
import com.google.sps.data.GriddedData;

/**
 * This servlet retrieves AQI data for a given map area and
 * zoom level and returns it to the client.
 * The data is represented as a grid, which is returned to the client along
 * with the resolution (in metres) and coordinates of the top left corner of
 * the grid
 */
@WebServlet("/visualisation")
public class VisualisationServlet extends HttpServlet {

  private static final long serialVersionUID = 5770012060147035495L;

  @Override
  public void doGet(HttpServletRequest request, HttpServletResponse response) throws IOException {
    int zoomLevel = Integer.parseInt(request.getParameter("zoom-level"));
    double swLong = Double.parseDouble(request.getParameter("sw-long"));
    double swLat = Double.parseDouble(request.getParameter("sw-lat"));
    double neLong = Double.parseDouble(request.getParameter("ne-long"));
    double neLat = Double.parseDouble(request.getParameter("ne-lat"));
    Coordinates swCorner = new Coordinates(swLong, swLat);
    Coordinates neCorner = new Coordinates(neLong, neLat);

    Cache cache = new Cache();
    GriddedData dataGrid = cache.getGrid(zoomLevel, swCorner, neCorner);

    // String testJsonString = "[" +
    // "{ \"stationName\":\"Sydney\"," +
    // "\"lat\": -33.8688," +
    // "\"long\": 151.2093," +
    // "\"aqi\": 124" +
    // "}," +
    // "{" +
    // "\"stationName\": \"Canberra\"," +
    // "\"lat\": -35.2809, " +
    // "\"long\": 149.1300," +
    // "\"aqi\": 39" +
    // "}," +
    // "{" +
    // "\"stationName\": \"Wollongong\"," +
    // "\"lat\": -34.4278," +
    // "\"long\": 150.8931," +
    // "\"aqi\": 62" +
    // "}," +
    // "{" +
    // "\"stationName\": \"Sydney\"," +
    // "\"lat\": -34.7479," +
    // "\"long\": 149.7277," +
    // "\"aqi\": 46" +
    // "}" +
    // "]";

    response.setContentType("application/json; charset=UTF-8");
    response.setCharacterEncoding("UTF-8");
    response.getWriter().println(dataGrid);
  }
}
