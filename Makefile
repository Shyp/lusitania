.PHONY: install test

circle-install:
	curl --remote-name https://raw.githubusercontent.com/Shyp/set-node-npm/master/set-node-npm
	chmod +x set-node-npm
	./set-node-npm

install:
	npm --version
	npm install

test:
	node --version
	./node_modules/.bin/mocha
