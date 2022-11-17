package cn.apisium.lab.data;

import io.vertx.codegen.annotations.DataObject;
import io.vertx.core.json.JsonObject;
import io.vertx.sqlclient.templates.annotations.ParametersMapped;
import io.vertx.sqlclient.templates.annotations.RowMapped;

@DataObject
@RowMapped
@ParametersMapped
public final class UserDataObject {
	private int id;
	private String name;

	public UserDataObject() {}

	@SuppressWarnings("unused")
	public UserDataObject(JsonObject json) {
		id = json.getInteger("id");
		name = json.getString("name");
	}

	public UserDataObject(int id, String name) {
		this.id = id;
		this.name = name;
	}

	public UserDataObject(int id) {
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
}
