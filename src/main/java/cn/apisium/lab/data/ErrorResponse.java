package cn.apisium.lab.data;

import io.vertx.codegen.annotations.DataObject;
import org.jetbrains.annotations.NotNull;

@DataObject
public final class ErrorResponse {
	private String error;

	public ErrorResponse(@NotNull String error) {
		this.error = error;
	}

	@SuppressWarnings("unused")
	@NotNull
	public String getError() {
		return error;
	}

	@SuppressWarnings("unused")
	public void setError(@NotNull String error) {
		this.error = error;
	}
}
