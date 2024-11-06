PROJECT = ska-ser-headlamp-plugins
HELM_RELEASE ?= ska-ser-headlamp-plugins

include .make/base.mk
include .make/oci.mk
include .make/js.mk

-include PrivateRules.mak

PLUGINS_DIR = src
PLUGINS_OUTPUT_DIR = dist
PLUGINS = $(shell if [ -d $(PLUGINS_DIR) ]; then cd $(PLUGINS_DIR) > /dev/null; for name in $$(ls); do if [ -d $$name ]; then echo $$name; fi done; fi;)

ifneq ($(CI_PIPELINE_ID),)
OCI_BUILD_ADDITIONAL_ARGS = --network=host
endif

OCI_IMAGE_BUILD_CONTEXT=$(PWD)

js-do-install:
	@for PLUGIN in $(PLUGINS); do \
		cd $(PLUGINS_DIR)/$$PLUGIN; \
			npm install; \
		cd -; \
	done

js-do-lint:
	@for PLUGIN in $(PLUGINS); do \
		cd $(PLUGINS_DIR)/$$PLUGIN; \
			npm run lint; \
		cd -; \
	done

js-do-format:
	@for PLUGIN in $(PLUGINS); do \
		cd $(PLUGINS_DIR)/$$PLUGIN; \
			npm run lint-fix; \
			npm run format; \
		cd -; \
	done

oci-pre-build-all:
	@rm -rf $(PLUGINS_OUTPUT_DIR)

dev:
	@for PLUGIN in $(PLUGINS); do \
		cd $(PLUGINS_DIR)/$$PLUGIN; \
			npm run start & \
		cd -; \
	done; \

stop-dev:
	kill -9 $(ps -a | grep "npm run start" | awk '{print $1}' | xargs)
