package com.google.sps.servlets;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;

import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

@WebServlet("/visualisation")
public class VisualisationServlet extends HttpServlet {

  private static final long serialVersionUID = 5770012060147035495L;

  @Override
  public void doGet(HttpServletRequest request, HttpServletResponse response) throws IOException {
    Path dirPath = Paths.get(".").toAbsolutePath();
    Path filepath = Paths.get(dirPath.toString(), "WEB-INF/classes/com/google/sps/servlets/testData.json");
    String testJsonString = new String(Files.readAllBytes(filepath));

    response.setContentType("application/json; charset=UTF-8");
    response.setCharacterEncoding("UTF-8");
    response.getWriter().println(testJsonString);
  }
}
