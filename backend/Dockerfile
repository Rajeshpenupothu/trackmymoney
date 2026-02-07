# Stage 1: Build with Maven
FROM maven:3.9.6-eclipse-temurin-17 AS builder

WORKDIR /build

# Copy pom.xml and source
COPY pom.xml .
COPY src ./src
COPY .mvn ./.mvn
COPY mvnw .

# Make mvnw executable and build the application
RUN chmod +x mvnw && ./mvnw clean package -DskipTests

# Stage 2: Runtime with JRE only (smaller image)
FROM eclipse-temurin:17-jre-alpine

WORKDIR /app

# Set proper character encoding and locale
ENV LANG=C.UTF-8 \
    LC_ALL=C.UTF-8 \
    JAVA_TOOL_OPTIONS="-Dfile.encoding=UTF-8 -Dsun.jnu.encoding=UTF-8"

# Copy the JAR from builder stage
COPY --from=builder /build/target/backend-0.0.1-SNAPSHOT.jar app.jar

# Expose port (Render will override this)
EXPOSE 8080

# Health check (using a simple port check instead of HTTP)
HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:${PORT:-8080}/ || exit 1

# Run the application
ENTRYPOINT ["java", "-XX:+UseG1GC", "-XX:MaxRAMPercentage=75.0", "-jar", "app.jar"]
