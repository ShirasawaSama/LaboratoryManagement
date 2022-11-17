package cn.apisium.lab;

import cn.apisium.lab.routes.Rooms;
import cn.apisium.lab.routes.Users;
import io.vertx.core.AbstractVerticle;
import io.vertx.core.Promise;
import io.vertx.core.impl.logging.Logger;
import io.vertx.core.impl.logging.LoggerFactory;
import io.vertx.ext.web.Router;
import io.vertx.ext.web.handler.BodyHandler;
import io.vertx.ext.web.handler.StaticHandler;
import io.vertx.jdbcclient.JDBCConnectOptions;
import io.vertx.jdbcclient.JDBCPool;
import io.vertx.sqlclient.*;
import io.vertx.sqlclient.impl.SqlClientInternal;
import io.vertx.sqlclient.templates.SqlTemplate;
import io.vertx.sqlclient.templates.impl.SqlTemplateImpl;
import org.intellij.lang.annotations.Language;
import org.jetbrains.annotations.NotNull;

import java.util.Map;
import java.util.function.Function;

public final class MainVerticle extends AbstractVerticle {
	private static final Logger logger = LoggerFactory.getLogger(MainVerticle.class);
	private Pool pool;

	/**
	 * Create an SQL template for query purpose consuming map parameters and returning {@link Row}.
	 *
	 * @param template the template query string
	 * @return the template
	 */
	@NotNull
	public SqlTemplate<Map<String, Object>, RowSet<Row>> forQuery(@Language("SQL") @NotNull String template) {
		io.vertx.sqlclient.templates.impl.SqlTemplate sqlTemplate = io.vertx.sqlclient.templates.impl.SqlTemplate.create((SqlClientInternal) pool, template);
		return new SqlTemplateImpl<>(pool, sqlTemplate, Function.identity(), sqlTemplate::mapTuple);
	}

	/**
	 * Create an SQL template for query purpose consuming map parameters and returning void.
	 *
	 * @param template the template update string
	 * @return the template
	 */
	@NotNull
	public SqlTemplate<Map<String, Object>, SqlResult<Void>> forUpdate(@Language("SQL") @NotNull String template) {
		io.vertx.sqlclient.templates.impl.SqlTemplate sqlTemplate = io.vertx.sqlclient.templates.impl.SqlTemplate.create((SqlClientInternal) pool, template);
		return new SqlTemplateImpl<>(pool, sqlTemplate, query -> query.collecting(SqlTemplateImpl.NULL_COLLECTOR), sqlTemplate::mapTuple);
	}

	@Override
	public void start(Promise<Void> startPromise) {
		initDatabase();

		vertx.createHttpServer().requestHandler(initRoutes()).listen(8888, http -> {
			if (http.succeeded()) {
				startPromise.complete();
				logger.info("HTTP server started on port 8888");
			} else {
				startPromise.fail(http.cause());
			}
		});
	}

	/**
	 * Init routers.
	 *
	 * @return Initialized routers.
	 */
	@NotNull
	private Router initRoutes() {
		Router router = Router.router(vertx);
		router.route().handler(BodyHandler.create());
		router.route("/*").handler(StaticHandler.create("dist"));
		new Users(this, router);
		new Rooms(this, router);
		return router;
	}

	/**
	 * Init database and create tables.
	 */
	private void initDatabase() {
		pool = JDBCPool.pool(
				vertx,
				new JDBCConnectOptions().setJdbcUrl("jdbc:h2:./default;AUTO_SERVER=TRUE"),
				new PoolOptions().setMaxSize(16)
		);

		// Define a table called laboratory rooms with item id, name and owner
		// And define a table called users with user id, username
		// The owner is a foreign key to the users table
		pool.query("""
				CREATE TABLE IF NOT EXISTS USERS (
					ID INT PRIMARY KEY AUTO_INCREMENT,
					NAME VARCHAR(255) NOT NULL
				);
				CREATE TABLE IF NOT EXISTS ROOMS (
					ID INT PRIMARY KEY AUTO_INCREMENT,
					NAME VARCHAR(255) NOT NULL,
					OWNER INT NOT NULL,
					FOREIGN KEY (OWNER) REFERENCES USERS(ID)
				);
				""").execute(ar -> {
			if (ar.succeeded()) {
				logger.info("Database initialized.");
			} else {
				logger.error("Could not initialize the database:");
				ar.cause().printStackTrace();
			}
		});
	}
}
