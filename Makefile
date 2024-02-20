.ONESHELL:
.PHONY: minibin

minibin:
	cd client && bun install && bun run build
	cd ../server && go build
	cp minibin ../minibin

clean:
	rm -rf server/dist
	rm server/minibin
	rm minibin