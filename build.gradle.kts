import com.github.jengelman.gradle.plugins.shadow.tasks.ShadowJar
import org.gradle.api.tasks.testing.logging.TestLogEvent.*

plugins {
	java
	application
	id("com.github.johnrengelman.shadow") version "7.1.2"
}

group = "cn.apisium"
version = "1.0.0-SNAPSHOT"

repositories {
	maven {
		url = uri("https://s01.oss.sonatype.org/content/repositories/snapshots")
		mavenContent {
			snapshotsOnly()
		}
	}
	mavenCentral()
}

val vertxVersion = "4.3.5-SNAPSHOT"
val junitJupiterVersion = "5.7.0"

val mainVerticleName = "cn.apisium.lab.MainVerticle"
val launcherClassName = "io.vertx.core.Launcher"

val watchForChange = "src/**/*"
val doOnChange = "${projectDir}/gradlew classes"

application {
	mainClass.set(launcherClassName)
}

dependencies {
	implementation(platform("io.vertx:vertx-stack-depchain:$vertxVersion"))
	implementation("io.vertx:vertx-jdbc-client")
	implementation("io.agroal:agroal-api:2.0")
	implementation("io.agroal:agroal-pool:2.0")
	implementation("io.vertx:vertx-web")
	implementation("com.h2database:h2:2.1.214")
	implementation("org.jetbrains:annotations:23.0.0")
	implementation("io.vertx:vertx-sql-client-templates:4.3.5")
	implementation("com.fasterxml.jackson.core:jackson-databind:2.14.0")

	compileOnly("io.vertx:vertx-codegen:4.3.4")
	annotationProcessor("io.vertx:vertx-codegen:4.3.4")
}

java {
	sourceCompatibility = JavaVersion.VERSION_17
	targetCompatibility = JavaVersion.VERSION_17
}

sourceSets {
	main {
		java {
			srcDirs(project.file("${project.buildDir}/generated/main/java"))
		}
	}
}

tasks.withType<ShadowJar> {
	archiveClassifier.set("fat")
	manifest {
		attributes(mapOf("Main-Verticle" to mainVerticleName))
	}
	mergeServiceFiles()
}

tasks.withType<Test> {
	useJUnitPlatform()
	testLogging {
		events = setOf(PASSED, SKIPPED, FAILED)
	}
}

tasks.withType<JavaExec> {
	args = listOf(
		"run",
		mainVerticleName,
		"--redeploy=$watchForChange",
		"--launcher-class=$launcherClassName",
		"--on-redeploy=$doOnChange"
	)
}

tasks.compileJava {
	dependsOn(tasks.named("annotationProcessing"))
}

tasks.register<JavaCompile>("annotationProcessing") {
	group = "other"
	source = sourceSets.getByName(SourceSet.MAIN_SOURCE_SET_NAME).java
	destinationDirectory.set(project.file("${project.buildDir}/generated/main/java"))
	classpath = configurations.compileClasspath.get()
	options.annotationProcessorPath = configurations.compileClasspath.get()
	options.compilerArgs = listOf(
		"-proc:only",
		"-processor", "io.vertx.codegen.CodeGenProcessor",
		"-Acodegen.output=${project.projectDir}/src/main"
	)
}
