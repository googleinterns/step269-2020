package com.google.sps.servlets;

import java.io.IOException;

import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

@WebServlet("/visualisation")
public class VisualisationServlet extends HttpServlet {

  private static final long serialVersionUID = 5770012060147035495L;

  @Override
  public void doGet(HttpServletRequest request, HttpServletResponse response) throws IOException {

    String testJsonString = "[" +
    "{ \"stationName\":\"Sydney\"," +
        "\"lat\": -33.8688," +
    "\"long\": 151.2093," +
    "\"aqi\": 124" +
    "}," +
    "{" +
    "\"stationName\": \"Canberra\"," +
    "\"lat\": -35.2809, " +
    "\"long\": 149.1300," +
    "\"aqi\": 39" +
    "}," +
    "{" +
    "\"stationName\": \"Wollongong\"," +
    "\"lat\": -34.4278," +
    "\"long\": 150.8931," +
    "\"aqi\": 62" +
    "}," +
    "{" +
    "\"stationName\": \"Sydney\"," +
    "\"lat\": -34.7479," +
    "\"long\": 149.7277," +
    "\"aqi\": 46" +
    "}" +
    "]";

    response.setContentType("application/json; charset=UTF-8");
    response.setCharacterEncoding("UTF-8");
    response.getWriter().println(testJsonString);
  }
}
