SKA Headlamp Plugins
====================

SKA Headlamp Plugins provides various plugins to be added to headlamp. The way to use them is to mount the image built in this repository as an init container and copy the built plugin files to a volume mounted to Headlamp's plugin directory.

Provided plugins:

  * ska-logo: Changes the web app logo to the SKAO logo. Based of an `example plugin <https://github.com/headlamp-k8s/headlamp/tree/main/plugins/examples/change-logo>`_
  * ska-prometheus: Modified `plugin <https://github.com/headlamp-k8s/plugins/tree/main/prometheus>`_ plugin that allows to connect to a configurable prometheus instance
  * ska-tango - Add support to view **tango.tango-controls.org/v1** CRDs and some TANGO Database status data

.. toctree::
  :maxdepth: 1
  :caption: README

  README.md