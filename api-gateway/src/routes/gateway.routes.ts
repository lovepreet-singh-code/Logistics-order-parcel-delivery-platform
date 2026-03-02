import { Router } from "express";
import { createProxyMiddleware } from "http-proxy-middleware";
import { env } from "../config/env";

const gatewayRouter = Router();

const createServiceProxy = (target: string, basePath: string) =>
  createProxyMiddleware({
    target,
    changeOrigin: true,
    pathRewrite: (path) => path.replace(new RegExp(`^${basePath}`), ""),
  });

gatewayRouter.use("/auth", createServiceProxy(env.authServiceUrl, "/auth"));
gatewayRouter.use("/users", createServiceProxy(env.userServiceUrl, "/users"));
gatewayRouter.use(
  "/franchise",
  createServiceProxy(env.franchiseServiceUrl, "/franchise"),
);
gatewayRouter.use(
  "/vehicles",
  createServiceProxy(env.vehicleServiceUrl, "/vehicles"),
);
gatewayRouter.use("/orders", createServiceProxy(env.orderServiceUrl, "/orders"));
gatewayRouter.use(
  "/planning",
  createServiceProxy(env.planningServiceUrl, "/planning"),
);
gatewayRouter.use(
  "/notifications",
  createServiceProxy(env.notificationServiceUrl, "/notifications"),
);

export default gatewayRouter;
