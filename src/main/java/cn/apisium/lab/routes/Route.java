package cn.apisium.lab.routes;

import io.vertx.ext.web.Router;
import org.jetbrains.annotations.NotNull;

interface Route {
    /**
     * Register the route to the router.
     * @param router The router to register.
     */
    void registerRoutes(@NotNull Router router);
}
