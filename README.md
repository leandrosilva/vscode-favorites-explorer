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

## Install

Build the `.vsix` package, then install it through your editor's UI. This works
the same in **VSCode** and **Devin** (or any VSCode-based editor).

1. Build the package (needs Node; uses `@vscode/vsce` via `npx`):

   ```bash
   ./package.sh
   ```

   This produces `favorites-explorer-<version>.vsix` in the repo root.

2. In your editor, install from that file:
   - Open the **Extensions** view (`Cmd+Shift+X`)
   - Click the **`...`** menu → **"Install from VSIX..."**
   - Pick the generated `.vsix`

   (Or via the Command Palette: **"Extensions: Install from VSIX..."**.)

3. Reload the window when prompted. The **Favorites** section shows up at the
   bottom of the Explorer.

To update after code changes: bump `version` in `package.json`, run
`./package.sh` again, and install the new `.vsix` the same way.

> Note: dropping a symlink into `~/.vscode/extensions/` does **not** work — the
> editor's scanner ignores symlinked extension folders. Install from the `.vsix`.

## Switch to global favorites

In `extension.js`, replace `context.workspaceState` with `context.globalState`
in the `items` and `_save` methods.
