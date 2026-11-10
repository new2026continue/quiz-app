FROM maven:3.9-eclipse-temurin-17 AS builder
WORKDIR /build
COPY demo/pom.xml .
COPY demo/src ./src
RUN mvn dependency:go-offline -B
RUN mvn package -DskipTests -B

FROM eclipse-temurin:17-jre-alpine
WORKDIR /app
COPY --from=builder /build/target/*.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]