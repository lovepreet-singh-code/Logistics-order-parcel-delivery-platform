import { Router } from "express";
import {
  assignArea,
  deleteUser,
  getUserById,
  getUsers,
  updateUser,
} from "../controllers/user.controller";

const userRouter = Router();

userRouter.get("/users/:id", getUserById);
userRouter.get("/users", getUsers);
userRouter.put("/users/assign-area", assignArea);
userRouter.put("/users/:id", updateUser);
userRouter.delete("/users/:id", deleteUser);

export default userRouter;
