import { type Request, type Response } from "express";
import {
  getDailyReport,
  getFranchiseReport,
  getVehicleReport,
} from "../services/reporting.service";

export const getDailyStats = async (
  _req: Request,
  res: Response,
): Promise<void> => {
  const report = await getDailyReport();

  res.status(200).json({
    success: true,
    message: "Daily report fetched successfully",
    data: report,
  });
};

export const getFranchiseStats = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const franchiseId = req.params.id;

  if (!franchiseId || franchiseId.trim() === "") {
    res.status(400).json({
      success: false,
      message: "franchise id is required",
    });
    return;
  }

  const report = await getFranchiseReport(franchiseId.trim());

  if (!report) {
    res.status(404).json({
      success: false,
      message: "Franchise report not found",
    });
    return;
  }

  res.status(200).json({
    success: true,
    message: "Franchise report fetched successfully",
    data: report,
  });
};

export const getVehicleStats = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const vehicleId = req.params.id;

  if (!vehicleId || vehicleId.trim() === "") {
    res.status(400).json({
      success: false,
      message: "vehicle id is required",
    });
    return;
  }

  const report = await getVehicleReport(vehicleId.trim());

  if (!report) {
    res.status(404).json({
      success: false,
      message: "Vehicle report not found",
    });
    return;
  }

  res.status(200).json({
    success: true,
    message: "Vehicle report fetched successfully",
    data: report,
  });
};
