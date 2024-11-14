# SKA Headlamp Plugins

SKA Headlamp Plugins provides various plugins to be added to headlamp. The way to use them is to mount the image built in this repository as an init container and copy the built plugin files to a volume mounted to Headlamp's plugin directory.

## Motivation

In order to give Headlamp an enriched set of business-specific information, we want to build custom plugins. Currently, the focus is to bring some of TANGO's data into Headlamp.

## Capabilities

Currently, the SKA Headlamp Plugins provides the following plugins:

- [x] ska-logo: Use SKAO Logo
- [x] ska-prometheus: Built-in CPU, Memory, Network & Disk metrics for PODs and other resources
- [x] ska-owner-metadata: Display CICD Metadata with navigation
- [x] ska-organization: Custom tabs with namespace information per SKAO Team, User and Project
- [x] ska-helm-release: Information on installed releases in a namespace
- [x] flux: Information on FluxCD resources (BETA)
- [ ] ska-tango: Support for TANGO (operator) CRDs

## Plugins

### ska-logo

Based of https://github.com/headlamp-k8s/headlamp/tree/main/plugins/examples/change-logo.

### Changes

* Application logo to SKAO's logo (SVG)
* Simplified the overall example as we don't need settings or light/dark logos

### ska-prometheus

Based of https://github.com/headlamp-k8s/plugins/tree/main/prometheus.

### Changes

* Converted to call a **service** instead of a pod using the ApiProxy instance
* Label selector for the service set by replacing `<PROMETHEUS_PROXY_SERVICE_LABEL_SELECTOR>` in Headlamp
* Change Prometheus plots timeframe by setting `<PROMETHEUS_METRICS_QUERY_TIME_MINUTES>` in Headlamp
* Filter metrics using the `datacentre` label by setting `<PROMETHEUS_DATACENTRE_LABEL>` in Headlamp
* Added Prometheus metrics to the `Namespace` page

## Contribute

To contribute, simply checkout the repository:

```
git clone git@gitlab.com:ska-telescope/sdi/ska-ser-headlamp-plugins.git
git submodule update --init --recursive
```

To test locally the plugins, start by installing the Headlamp app locally:

```
VERSION=0.26.0 # Go to https://github.com/headlamp-k8s/headlamp/releases, get latest release
wget https://github.com/headlamp-k8s/headlamp/releases/download/v$VERSION/Headlamp-$VERSION-linux-x64.tar.gz -o headlamp
mkdir headlamp
tar xf headlamp.tar.gz -C headlamp --strip-components 1
cd headlamp
./headlamp
```

Afterwards, you deploy a plugin by doing:

```
cd src/<plugin>
npm run start
```

This will actively monitor changes to the plugin and deploy a built version to the local (app) plugin directory. Simply press `Ctrl+Shit+R` in the **headlamp** application to reload the plugin and test your changes.

Finally, you need to configure a valid cluster, by providing a kubeconfig. To do that, you shouldn't import, but rather copy the kubeconfigs. Below you find an example on how to do it for multiple kubeconfigs:

```
export KUBECONFIG=<path to kubeconfig 1>:<path to kubeconfig 2>:<path to kubeconfig n>
kubectl config view --flatten > ~/.config/Headlamp/kubeconfigs/config
```
