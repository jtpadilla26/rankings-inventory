# rankings-inventory
inventory management app

## Working around blocked npm installs
If your environment cannot reach the public npm registry (for example, requests are forced through a proxy that responds with `403 Forbidden`), the `next` CLI never gets installed and `npm run dev` exits with:

```
sh: 1: next: not found
```

A lightweight workaround is to install dependencies once on a machine that *does* have registry access, archive the resulting `node_modules` directory, and unpack it inside this repository.

1. On a connected machine run:
   ```bash
   npm ci
   tar -czf node_modules.tar.gz node_modules
   ```
2. Copy the generated `node_modules.tar.gz` into the root of this project (next to `package.json`).
3. Inside the restricted environment execute:
   ```bash
   ./scripts/offline-bootstrap.sh
   ```
   The script removes any stale `node_modules` folder and restores the dependencies from the archive.
4. Start the app as usual:
   ```bash
   npm run dev
   ```
   The dev script now checks for the bundled Next.js CLI and prints a clear offline hint if the dependencies are still missing.

This approach keeps the repository clean while still allowing local development when the registry is unreachable.
