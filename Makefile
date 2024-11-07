PROJECT = ska-ser-headlamp-plugins
HELM_RELEASE ?= ska-ser-headlamp-plugins
JS_PACKAGE_MANAGER ?= npm

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
			$(JS_PACKAGE_MANAGER) install; \
		cd -; \
	done

js-do-lint:
	@for PLUGIN in $(PLUGINS); do \
		cd $(PLUGINS_DIR)/$$PLUGIN; \
			$(JS_PACKAGE_MANAGER) run lint; \
		cd -; \
	done

js-do-format:
	@for PLUGIN in $(PLUGINS); do \
		cd $(PLUGINS_DIR)/$$PLUGIN; \
			$(JS_PACKAGE_MANAGER) run lint-fix; \
			$(JS_PACKAGE_MANAGER) run format; \
		cd -; \
	done

js-do-audit:
	@for PLUGIN in $(PLUGINS); do \
		cd $(PLUGINS_DIR)/$$PLUGIN; \
			$(JS_PACKAGE_MANAGER) audit $(JS_SWITCHES_FOR_AUDIT); \
		cd -; \
	done

js-audit-fix:
	@for PLUGIN in $(PLUGINS); do \
		cd $(PLUGINS_DIR)/$$PLUGIN; \
			$(JS_PACKAGE_MANAGER) audit fix $(JS_SWITCHES_FOR_AUDIT); \
		cd -; \
	done

oci-pre-build-all:
	@rm -rf $(PLUGINS_OUTPUT_DIR)

dev:
	@for PLUGIN in $(PLUGINS); do \
		cd $(PLUGINS_DIR)/$$PLUGIN; \
			$(JS_PACKAGE_MANAGER) run start & \
		cd -; \
	done; \

stop-dev:
	@PROCESSES=$$(ps -au | egrep "node.*headlamp-plugin start" | awk '{print $$2}' | xargs); \
	for PROCESS in $$PROCESSES; do \
		kill -9 $$PROCESS; \
	done;
