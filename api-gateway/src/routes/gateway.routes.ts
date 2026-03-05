import { Router } from "express";
import { createProxyMiddleware } from "http-proxy-middleware";
import { env } from "../config/env";

const gatewayRouter = Router();

const createServiceProxy = (target: string) =>
  createProxyMiddleware({
    target,
    changeOrigin: true,
  });

gatewayRouter.use("/auth", createServiceProxy(env.authServiceUrl));
gatewayRouter.use("/users", createServiceProxy(env.userServiceUrl));
gatewayRouter.use("/franchise", createServiceProxy(env.franchiseServiceUrl));
gatewayRouter.use("/vehicles", createServiceProxy(env.vehicleServiceUrl));
gatewayRouter.use("/orders", createServiceProxy(env.orderServiceUrl));
gatewayRouter.use("/planning", createServiceProxy(env.planningServiceUrl));
gatewayRouter.use(
  "/notifications",
  createServiceProxy(env.notificationServiceUrl),
);
gatewayRouter.use("/api/metrics", createServiceProxy(env.reportingServiceUrl));

export default gatewayRouter;
