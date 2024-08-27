# SKA Headlamp Plugins

SKA Headlamp Plugins provides various plugins to be added to headlamp. The way to use them is to mount the image built in this repository as an init container and copy the built plugin files to a volume mounted to Headlamp's plugin directory.

## Motivation

In order to give Headlamp an enriched set of business-specific information, we want to build custom plugins. Currently, the focus is to bring some of TANGO's data into Headlamp.

## Capabilities

Currently, the SKA Headlamp Plugins provides the following plugins:

- [x] Logo: Use SKAO Logo
- [x] Prometheus: Built-in Metrics for PODs and other resources from []()
- [ ] TangoControls: Support for TANGO (operator) CRDs

## Contribute

To contribute, simply checkout the repository:

```
git clone git@gitlab.com:ska-telescope/sdi/ska-ser-headlamp-plugins.git
git submodule update --init --recursive
```

To test locally the plugins, start by installing the Headlamp app locally:

```
VERSION=0.25.0 # Go to https://github.com/headlamp-k8s/headlamp/releases, get latest release
wget https://github.com/headlamp-k8s/headlamp/releases/download/v$VERSION/Headlamp-$VERSION-linux-x64.tar.gz -o headlamp
mkdir headlamp
tar xf headlamp.tar.gz -C headlamp --strip-components 1
cd headlamp
./headlamp
```

Afterwards, we can test the plugins by doing:

```
cd src/<plugin>
npm run start
```

This will actively monitor changes to the plugin and deploy a built version to the local (app) plugin directory. Simply press `Ctrl+Shit+R` in the **headlamp** application to reload the plugin and test your changes.
