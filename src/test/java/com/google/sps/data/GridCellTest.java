package com.google.sps.data;

import org.junit.Assert;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.junit.runners.JUnit4;

@RunWith(JUnit4.class)
public final class GridCellTest {
  private static final AQDataPoint INVALID_AQ_POINT = new AQDataPoint("testSite", -1, -32, 150);
  private static final AQDataPoint ZERO_AQ_POINT = new AQDataPoint("testSite", 0, -32, 150);
  private static final AQDataPoint POSITIVE_AQ_POINT = new AQDataPoint("testSite", 24.55, -32, 150);

  private static final double ZERO_WEIGHT = 0;
  private static final double POSITIVE_WEIGHT = 0.7;

  private static final double INITIAL_WEIGHT_SUM = 1.3;
  private static final double INITIAL_WEIGHTED_TOTAL = 36;

  private GridCell newTemplateCell() {
    GridCell cell = new GridCell();
    cell.runningWeightSum = INITIAL_WEIGHT_SUM;
    cell.runningWeightedTotal = INITIAL_WEIGHTED_TOTAL;
    return cell;
  }

  @Test
  public void addInvalidAQI() {
    GridCell cell = newTemplateCell();
    double expected = cell.getAQI();
    cell.addPointWithWeight(INVALID_AQ_POINT, POSITIVE_WEIGHT);
    double actual = cell.getAQI();
    Assert.assertEquals(expected, actual, 0);
  }

  @Test
  public void addZeroAQI() {
    GridCell cell = newTemplateCell();
    cell.addPointWithWeight(ZERO_AQ_POINT, POSITIVE_WEIGHT);
    double expected = 18.0;
    double actual = cell.getAQI();
    Assert.assertEquals(expected, actual, 0);
  }

  @Test
  public void addValidAQIZeroWeight() {
    GridCell cell = newTemplateCell();
    double expected = cell.getAQI();
    cell.addPointWithWeight(POSITIVE_AQ_POINT, ZERO_WEIGHT);
    double actual = cell.getAQI();
    Assert.assertEquals(expected, actual, 0);
  }
    
  @Test
  public void addValidAQIPositiveWeight() {
    GridCell cell = newTemplateCell();
    cell.addPointWithWeight(POSITIVE_AQ_POINT, POSITIVE_WEIGHT);
    double expected = 26.5925;
    double actual = cell.getAQI();
    Assert.assertEquals(expected, actual,0);
  }
}
