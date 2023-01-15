package cn.apisium.lab.routes;

import cn.apisium.lab.MainVerticle;
import cn.apisium.lab.data.ErrorResponse;
import cn.apisium.lab.data.UserDataObject;
import cn.apisium.lab.data.UserDataObjectParametersMapper;
import io.vertx.core.Future;
import io.vertx.core.json.JsonObject;
import io.vertx.ext.web.Router;
import io.vertx.ext.web.RoutingContext;
import io.vertx.sqlclient.Row;
import org.jetbrains.annotations.NotNull;

/**
 * Users route
 */
public final class Users extends AbstractRoute {
	public Users(@NotNull MainVerticle main, @NotNull Router router) {
		super(main, router);
	}

	@Override
	public void registerRoutes(@NotNull Router router) {
		router.get("/api/users").respond(this::handleFetchUsers);
		router.put("/api/user").respond(this::handlePutUser);
		router.delete("/api/user").respond(this::handleDeleteUser);
	}

	@NotNull
	private Future<?> handleFetchUsers(RoutingContext ctx) {
		return main.forQuery("SELECT * FROM USERS;").mapTo(Row::toJson).execute(null);
	}

	@NotNull
	private Future<?> handlePutUser(RoutingContext ctx) {
		var body = ctx.body().asJsonObject();
		var id = body.getInteger("id");
		return main.forUpdate(id == null
						? "INSERT INTO USERS (NAME) VALUES (#{name});"
						: "UPDATE USERS SET NAME = #{name} WHERE ID = #{id};")
				.mapFrom(UserDataObjectParametersMapper.INSTANCE)
				.execute(new UserDataObject(id == null ? 0 : id, body.getString("name")))
				.map(it -> it.rowCount() == 1 ? new JsonObject() : new ErrorResponse("Failed to update data."));
	}

	@NotNull
	private Future<?> handleDeleteUser(RoutingContext ctx) {
		return main.forUpdate("DELETE FROM USERS WHERE ID = #{id};")
				.mapFrom(UserDataObjectParametersMapper.INSTANCE)
				.execute(new UserDataObject(ctx.body().asJsonObject().getInteger("id")))
				.map(it -> it.rowCount() == 1 ? new JsonObject() : new ErrorResponse("Failed to delete data."));
	}
}
