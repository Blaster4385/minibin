# Minibin

This is a simple code sharing service and a URL shortener inspired by [katbin](https://katb.in).

## Features

- **Simplified Sharing:** Enable users to easily share code snippets by pasting them into a text box, generating a shortened URL, and sharing it with others.
- **URL Shortening:** Implement a URL shortening feature to condense lengthy URLs generated for shared code snippets, making them more manageable and easier to share across various platforms.
- **Syntax Highlighting:** Enhance code readability by incorporating syntax highlighting for different programming languages, ensuring that shared code snippets are presented clearly and accurately to viewers.

## Tech Stack

- [Bun](https://bun.sh/)
- [Vite](https://vitejs.dev/)
- [React](https://reactjs.org/)
- [Prismjs](https://prismjs.com/)
- [Go](https://go.dev/)
- [SQLite](https://www.sqlite.org/)

## Building

- Setup the required variables in the env file.
- Build the binary
```bash
make minibin
```

#### Running

Run the server.

```bash
./minibin
```

##### Optional flags

- `--port` - The port to run the server on. Default is 8080.
- `--db` - The path to the database file. Default is `./minibin.db`.

## License

This project is licensed under the GNU General Public License v3. See the LICENSE file for details.
