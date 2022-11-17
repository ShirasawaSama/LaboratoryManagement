package cn.apisium.lab.data;

import io.vertx.codegen.annotations.DataObject;

@DataObject
public final class ErrorResponse {
	private String error;

	public ErrorResponse(String error) {
		this.error = error;
	}

	@SuppressWarnings("unused")
	public String getError() {
		return error;
	}

	@SuppressWarnings("unused")
	public void setError(String error) {
		this.error = error;
	}
}
