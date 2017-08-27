.PHONY: all
all: LICENSE README.md

.PHONY: LICENSE
LICENSE:
	node_modules/.bin/sanctuary-update-copyright-year

README.md: index.js package.json
	node_modules/.bin/sanctuary-generate-readme index.js


.PHONY: doctest
doctest:
	node_modules/.bin/sanctuary-doctest


.PHONY: lint
lint: $(shell find . -name '*.js' '(' -depth 1 -or -path './test/*' ')')
	node_modules/.bin/sanctuary-check-required-files
	node_modules/.bin/eslint -- $^
	node_modules/.bin/sanctuary-lint-package-json
	node_modules/.bin/sanctuary-lint-bower-json
	node_modules/.bin/sanctuary-lint-readme
	node_modules/.bin/sanctuary-lint-commit-message


.PHONY: release-major release-minor release-patch
release-major release-minor release-patch:
	@node_modules/.bin/sanctuary-release $(@:release-%=%)


.PHONY: setup
setup:
	npm --version
	npm install


.PHONY: test
test:
	node_modules/.bin/sanctuary-test
	make doctest
