import { Router } from "express";
import {
  addPincode,
  createFranchise,
  getFranchises,
  lookupFranchiseByPincode,
} from "../controllers/franchise.controller";

const franchiseRouter = Router();

franchiseRouter.post("/franchise", createFranchise);
franchiseRouter.get("/franchise", getFranchises);
franchiseRouter.post("/franchise/add-pincode", addPincode);
franchiseRouter.get("/franchise/pincode/:code", lookupFranchiseByPincode);

export default franchiseRouter;
