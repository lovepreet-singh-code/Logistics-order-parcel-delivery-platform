import { Router } from "express";
import {
  getDailyStats,
  getFranchiseStats,
  getVehicleStats,
} from "../controllers/reporting.controller";

const reportsRouter = Router();

reportsRouter.get("/daily", getDailyStats);
reportsRouter.get("/franchise/:id", getFranchiseStats);
reportsRouter.get("/vehicle/:id", getVehicleStats);

export default reportsRouter;
