FROM eclipse-temurin:17-jre-alpine

WORKDIR /app

# Add a group and user
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

# Create app directory and set ownership
RUN mkdir -p /app && chown -R appuser:appgroup /app
# Create uploads directory for avatars
RUN mkdir -p /app/src/main/resources/static/uploads/avatars && chown -R appuser:appgroup /app/src/main/resources/static

COPY target/userservice-0.0.1-SNAPSHOT.jar app.jar

# Change ownership of the application file
RUN chown appuser:appgroup /app/app.jar

# Switch to non-root user
USER appuser

EXPOSE 1010

ENTRYPOINT ["java", "-jar", "app.jar"]