package cn.apisium.lab.routes;

import io.vertx.ext.web.Router;
import org.jetbrains.annotations.NotNull;

interface Route {
    void registerRoutes(@NotNull Router router);
}
