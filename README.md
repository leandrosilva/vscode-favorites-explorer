# Favorites Explorer

A personal VSCode extension: a **Favorites** section inside the Explorer panel,
with shortcuts (links) to files and folders.

## What it does

- A **Favorites** section in the Explorer (next to Outline / Timeline).
- Context menu **"Add to Favorites"** when you right-click a file or folder.
- Clicking a favorite:
  - **file** → opens it in the editor;
  - **folder** → reveals/expands it in the native Explorer.
- Inline icons on each item: 👁 reveal in Explorer, ✕ remove.
- Favorites are **per project** (`workspaceState`) and **never committed to
  git** — they live in VSCode's internal state.

## Test (dev)

1. Open this folder in VSCode.
2. `F5` → launches an "Extension Development Host" window with the extension active.
3. In that window, open any project and use the context menu.

## Install for good (just for you)

Copy or symlink this folder into `~/.vscode/extensions/` and restart VSCode:

```bash
ln -s "$PWD" ~/.vscode/extensions/favorites-explorer
```

(or `cp -R "$PWD" ~/.vscode/extensions/favorites-explorer`)

To uninstall: remove that folder/symlink and restart VSCode.

## Switch to global favorites

In `extension.js`, replace `context.workspaceState` with `context.globalState`
in the `items` and `_save` methods.
