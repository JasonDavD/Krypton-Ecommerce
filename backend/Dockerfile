# ---- build ----
# Imagen Maven oficial (evita problemas de permisos/CRLF del wrapper en Linux).
FROM maven:3.9-eclipse-temurin-17 AS build
WORKDIR /app
# Cachea dependencias: copia el pom y resuelve offline antes del código fuente.
COPY pom.xml ./
RUN mvn -q -B dependency:go-offline
COPY src/ src/
RUN mvn -q -B clean package -DskipTests

# ---- run ----
FROM eclipse-temurin:17-jre
WORKDIR /app
COPY --from=build /app/target/krypton-backend-0.0.1-SNAPSHOT.jar app.jar
# Render inyecta $PORT; application.yml ya lo lee (server.port=${PORT:8080}).
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
