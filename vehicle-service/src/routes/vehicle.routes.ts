import { Router } from "express";
import {
  createVehicle,
  deleteVehicle,
  getVehicleById,
  getVehicles,
  updateVehicle,
  updateVehicleStatus,
} from "../controllers/vehicle.controller";

const vehicleRouter = Router();

vehicleRouter.post("/", createVehicle);
vehicleRouter.get("/", getVehicles);
vehicleRouter.get("/:id", getVehicleById);
vehicleRouter.put("/:id", updateVehicle);
vehicleRouter.patch("/:id/status", updateVehicleStatus);
vehicleRouter.delete("/:id", deleteVehicle);

export default vehicleRouter;
