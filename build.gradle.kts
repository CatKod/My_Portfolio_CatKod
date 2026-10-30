plugins {
    kotlin("jvm") version "2.1.0"
    application
}

group = "catkod.portfolio"
version = "1.0.0"

kotlin {
    jvmToolchain(21)
}

application {
    mainClass.set("catkod.portfolio.MainKt")
    applicationDefaultJvmArgs = listOf("-Xss2m")
}

tasks.named<Jar>("jar") {
    manifest {
        attributes["Main-Class"] = "catkod.portfolio.MainKt"
    }
    archiveFileName.set("portfolio-kt.jar")
    duplicatesStrategy = DuplicatesStrategy.EXCLUDE
    from(configurations.runtimeClasspath.get().map { if (it.isDirectory) it else zipTree(it) })
}

tasks.withType<JavaExec>().configureEach {
    // Cho phép chạy `gradle run` với tham số tuỳ biến
    if (project.hasProperty("args")) {
        args((project.property("args") as String).split(" "))
    }
}
