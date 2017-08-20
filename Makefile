MOCHA = node_modules/.bin/mocha
NPM = npm


.PHONY: all
all: LICENSE README.md

.PHONY: LICENSE
LICENSE:
	node_modules/.bin/sanctuary-update-copyright-year

README.md: index.js package.json
	node_modules/.bin/sanctuary-generate-readme index.js


.PHONY: doctest
doctest:
	node_modules/.bin/sanctuary-doctest index.js


.PHONY: lint
lint:
	node_modules/.bin/sanctuary-lint-es3 \
	  --global define \
	  --global module \
	  --global require \
	  --global self \
	  -- index.js
	node_modules/.bin/sanctuary-lint-es3 \
	  --env node \
	  --global suite \
	  --global test \
	  --rule 'max-len: [off]' \
	  -- test
	node_modules/.bin/sanctuary-check-required-files
	node_modules/.bin/sanctuary-lint-package-json
	node_modules/.bin/sanctuary-lint-bower-json
	node_modules/.bin/sanctuary-lint-readme
	node_modules/.bin/sanctuary-lint-commit-message


.PHONY: release-major release-minor release-patch
release-major release-minor release-patch:
	@node_modules/.bin/sanctuary-release $(@:release-%=%)


.PHONY: setup
setup:
	$(NPM) --version
	$(NPM) install


.PHONY: test
test:
	$(MOCHA) -- test/index.js
	make doctest
