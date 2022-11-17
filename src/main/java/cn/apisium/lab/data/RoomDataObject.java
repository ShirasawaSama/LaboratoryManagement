package cn.apisium.lab.data;

import io.vertx.codegen.annotations.DataObject;
import io.vertx.core.json.JsonObject;
import io.vertx.sqlclient.templates.annotations.ParametersMapped;
import io.vertx.sqlclient.templates.annotations.RowMapped;

@DataObject
@RowMapped
@ParametersMapped
public final class RoomDataObject {
	private int id, owner;
	private String name;

	public RoomDataObject() {}

	@SuppressWarnings("unused")
	public RoomDataObject(JsonObject json) {
		id = json.getInteger("id");
		name = json.getString("name");
		owner = json.getInteger("owner");
	}

	public RoomDataObject(int id, String name, int owner) {
		this.id = id;
		this.name = name;
		this.owner = owner;
	}

	public RoomDataObject(int id) {
		this.id = id;
	}

	public int getId() {
		return id;
	}

	public void setId(int id) {
		this.id = id;
	}

	public String getName() {
		return name;
	}

	public void setName(String name) {
		this.name = name;
	}

	public int getOwner() {
		return owner;
	}

	public void setOwner(int owner) {
		this.owner = owner;
	}
}
