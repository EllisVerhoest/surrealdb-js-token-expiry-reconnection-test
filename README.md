# Requirements

- [bun](https://bun.sh/)

# Setup

1. `bun i`

# Running tests

`surreal-instance.ts` has a `checkAndGetSurrealBinary` function that will automatically download a v2.3.0 surrealdb
binary for your system but this hasn't been extensively tested. You can manually set the path to the binary using the
environment variable `SURREAL_BIN_PATH` if it fails.

---

1. `bun test --timeout 10000`