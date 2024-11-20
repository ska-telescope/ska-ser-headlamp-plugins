SKA Headlamp Plugins
====================

SKA Headlamp Plugins provides various plugins to be added to headlamp. The way to use them is to mount the image built in this repository as an init container and copy the built plugin files to a volume mounted to Headlamp's plugin directory.

Provided plugins:

  * ska-logo: Changes the web app logo to the SKAO logo. Based of an `example plugin <https://github.com/headlamp-k8s/headlamp/tree/main/plugins/examples/change-logo>`_
  * ska-prometheus: Modified `plugin <https://github.com/headlamp-k8s/plugins/tree/main/prometheus>`_ plugin that allows to connect to a configurable prometheus instance
  * ska-owner-metadata: Display information present in CICD metadata (kubernetes resource label and annotations) with navigation
  * ska-organization: Adds information about the namespaces belonging to the different Teams, Users and Projects
  * ska-helm-release: Shows Helm releases in namespaces, along with its sub-charts. For the sub-charts, looks for their latest versions in CAR.
  * flux: `FluxCD <https://github.com/headlamp-k8s/plugins/tree/main/flux>`_ plugin
  * ska-tango: Support SKA Tango Operator CRDs - DeviceServer and DatabaseDS - with TANGO DB information

.. toctree::
  :maxdepth: 1
  :caption: README

  README.md