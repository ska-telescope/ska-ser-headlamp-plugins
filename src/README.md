# SKA Headlamp Plugins

These following plugins are based of:

### ska-logo

Based of https://github.com/headlamp-k8s/headlamp/tree/main/plugins/examples/change-logo.

### Changes

* Application logo to SKAO's logo (SVG)
* Simplified the overall example as we don't need settings or light/dark logos

### ska-prometheus

Based of https://github.com/headlamp-k8s/plugins/tree/main/prometheus.

### Changes

* Converted to call a service instead of a pod using the ApiProxy object
* Label selector for the service set by setting `REACT_APP_PROMETHEUS_PROXY_SERVICE_LABEL_SELECTOR` in Headlamp
* Change Prometheus plots timeframe by setting `REACT_APP_PROMETHEUS_METRICS_QUERY_TIME_MINUTES` in Headlamp
* Filter metrics using the `datacentre` label by setting `REACT_APP_PROMETHEUS_DATACENTRE_LABEL` in Headlamp
