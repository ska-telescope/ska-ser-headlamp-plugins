ARG BASE_IMAGE="artefact.skao.int/ska-ser-headlamp-plugins:0.0.1"
FROM $BASE_IMAGE AS plugins-builder

# Run the plugin installation script inside the plugins-builder stage
RUN /bin/bash -c "/install-plugins.sh"

FROM ghcr.io/headlamp-k8s/headlamp:latest AS final

# Copy plugins from the custom builder image to the Headlamp plugins directory
COPY --from=plugins-builder /plugins /headlamp/plugins

# Switch to root to perform user modification
USER root

# Remove existing headlamp user and group
RUN deluser headlamp

# Add headlamp user and group with uid and gid 1000
RUN addgroup -g 1000 -S headlamp && adduser -u 1000 -G headlamp -S headlamp

# Ensure headlamp owns the /headlamp directory
RUN chown -R headlamp:headlamp /headlamp

# Install curl for easier debugging if needed
RUN apk add --no-cache curl

# Switch back to headlamp user
USER headlamp

# Define entrypoint and expose the necessary port for Headlamp
EXPOSE 4466

ENTRYPOINT ["/headlamp/headlamp-server", "-html-static-dir", "/headlamp/frontend", "-plugins-dir", "/headlamp/plugins"]
