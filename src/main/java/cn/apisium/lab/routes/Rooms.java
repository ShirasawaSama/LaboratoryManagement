package cn.apisium.lab.routes;

import cn.apisium.lab.MainVerticle;
import cn.apisium.lab.data.*;
import io.vertx.core.Future;
import io.vertx.core.json.JsonObject;
import io.vertx.ext.web.Router;
import io.vertx.ext.web.RoutingContext;
import io.vertx.sqlclient.Row;

public final class Rooms {
	private final MainVerticle main;

	public Rooms(MainVerticle main, Router router) {
		this.main = main;

		router.get("/api/rooms").respond(this::handleFetchRooms);
		router.put("/api/room").respond(this::handlePutRoom);
		router.delete("/api/room").respond(this::handleDeleteUser);
	}

	private Future<?> handleFetchRooms(RoutingContext ctx) {
		return main.forQuery("SELECT * FROM ROOMS;").mapTo(Row::toJson).execute(null);
	}

	private Future<?> handlePutRoom(RoutingContext ctx) {
		var body = ctx.body().asJsonObject();
		var id = body.getInteger("id");
		return main.forUpdate(id == null
						? "INSERT INTO ROOMS (NAME, OWNER) VALUES (#{name}, #{owner});"
						: "UPDATE ROOMS SET NAME = #{name}, OWNER = #{owner} WHERE id = #{id};")
				.mapFrom(RoomDataObjectParametersMapper.INSTANCE)
				.execute(new RoomDataObject(id == null ? 0 : id, body.getString("name"), body.getInteger("owner")))
				.map(it -> it.rowCount() == 1 ? new JsonObject() : new ErrorResponse("Failed to update data."));
	}

	private Future<?> handleDeleteUser(RoutingContext ctx) {
		return main.forUpdate("DELETE FROM ROOMS WHERE id = #{id};")
				.mapFrom(RoomDataObjectParametersMapper.INSTANCE)
				.execute(new RoomDataObject(ctx.body().asJsonObject().getInteger("id")))
				.map(it -> it.rowCount() == 1 ? new JsonObject() : new ErrorResponse("Failed to delete data."));
	}
}
