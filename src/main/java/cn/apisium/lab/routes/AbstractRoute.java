package cn.apisium.lab.routes;

import cn.apisium.lab.MainVerticle;
import org.jetbrains.annotations.NotNull;

public abstract class AbstractRoute implements Route {
    protected final MainVerticle main;

    public AbstractRoute(@NotNull MainVerticle main) {
        this.main = main;
    }
}
