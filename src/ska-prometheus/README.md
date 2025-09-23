# Prometheus

This plugin adds advanced charts to the details view of workload resources.

## Enabling Charts

For the charts to be shown, Prometheus must be installed in the cluster.

### Installing Prometheus from Headlamp

You can install Prometheus from Headlamp (desktop version only) by selecting the Apps
page from the sidebar, searching for "prometheus" and installing the app/chart from the "prometheus-community" repository.

### SKAO Edits

* src/index.tsx: Forcefully remove the section for the built-in prometheus plugin
* src/util.ts: Add Namespace kind as possible targets of prometheus graphs
* src/components/Settings/Settings.tsx: Remove settings that we don't want to let users change
* src/components/VisibilityButton/VisibilityButton.tsx: Show metrics by default
