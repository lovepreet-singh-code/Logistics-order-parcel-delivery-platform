import { Router } from "express";
import {
  createPlanning,
  deletePlanning,
  getPlanningById,
  getPlannings,
  updatePlanningStatus,
} from "../controllers/planning.controller";

const planningRouter = Router();

planningRouter.post("/", createPlanning);
planningRouter.get("/", getPlannings);
planningRouter.get("/:id", getPlanningById);
planningRouter.patch("/:id/status", updatePlanningStatus);
planningRouter.delete("/:id", deletePlanning);

export default planningRouter;
