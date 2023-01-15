package cn.apisium.lab.routes;

import cn.apisium.lab.MainVerticle;
import io.vertx.ext.web.Router;
import org.jetbrains.annotations.NotNull;

public abstract class AbstractRoute implements Route {
    protected final MainVerticle main;

    public AbstractRoute(@NotNull MainVerticle main, @NotNull Router router) {
        this.main = main;

        registerRoutes(router);
    }
}
