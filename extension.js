const vscode = require("vscode");
const path = require("path");

// Key under which the favorites list is persisted.
// workspaceState => per-project favorites, kept in VSCode's internal state
// (never committed to git). Swap for context.globalState for global favorites.
const STATE_KEY = "favoritesExplorer.items";

function activate(context) {
  const provider = new FavoritesProvider(context);

  const view = vscode.window.createTreeView("favoritesExplorer", {
    treeDataProvider: provider,
  });

  context.subscriptions.push(
    view,

    // Add to Favorites — invoked from the Explorer context menu.
    // Args: (clickedUri, selectedUris[]). From the palette, falls back to the
    // active editor.
    vscode.commands.registerCommand(
      "favoritesExplorer.add",
      async (uri, uris) => {
        const targets =
          uris && uris.length ? uris : uri ? [uri] : activeEditorUris();
        if (!targets.length) {
          vscode.window.showInformationMessage(
            "Nothing selected to add to Favorites."
          );
          return;
        }
        for (const u of targets) await provider.add(u);
      }
    ),

    vscode.commands.registerCommand("favoritesExplorer.remove", (item) => {
      if (item) provider.remove(item.fsPath);
    }),

    vscode.commands.registerCommand("favoritesExplorer.reveal", (item) => {
      if (item) {
        vscode.commands.executeCommand(
          "revealInExplorer",
          vscode.Uri.file(item.fsPath)
        );
      }
    }),

    vscode.commands.registerCommand("favoritesExplorer.clear", async () => {
      const ok = await vscode.window.showWarningMessage(
        "Remove all favorites from this project?",
        { modal: true },
        "Remove"
      );
      if (ok === "Remove") provider.clear();
    }),

    vscode.commands.registerCommand("favoritesExplorer.refresh", () =>
      provider.refresh()
    )
  );
}

function activeEditorUris() {
  const ed = vscode.window.activeTextEditor;
  return ed ? [ed.document.uri] : [];
}

class FavoritesProvider {
  constructor(context) {
    this.context = context;
    this._onDidChange = new vscode.EventEmitter();
    this.onDidChangeTreeData = this._onDidChange.event;
  }

  get items() {
    return this.context.workspaceState.get(STATE_KEY, []);
  }

  async _save(items) {
    // Sort: folders first, then by name — purely cosmetic.
    items.sort((a, b) => {
      if (a.type !== b.type) return a.type === "folder" ? -1 : 1;
      return path.basename(a.fsPath).localeCompare(path.basename(b.fsPath));
    });
    await this.context.workspaceState.update(STATE_KEY, items);
    this.refresh();
  }

  refresh() {
    this._onDidChange.fire();
  }

  async add(uri) {
    const fsPath = uri.fsPath;
    const items = this.items.slice();
    if (items.some((i) => i.fsPath === fsPath)) return; // already a favorite

    let type = "file";
    try {
      const stat = await vscode.workspace.fs.stat(uri);
      type = stat.type & vscode.FileType.Directory ? "folder" : "file";
    } catch {
      // if stat fails, assume it's a file
    }

    items.push({ fsPath, type });
    await this._save(items);
  }

  async remove(fsPath) {
    await this._save(this.items.filter((i) => i.fsPath !== fsPath));
  }

  async clear() {
    await this._save([]);
  }

  // --- TreeDataProvider ---

  getChildren() {
    return this.items;
  }

  getTreeItem(entry) {
    const uri = vscode.Uri.file(entry.fsPath);
    // Passing the Uri as the label auto-fills the file/folder name.
    const item = new vscode.TreeItem(
      uri,
      vscode.TreeItemCollapsibleState.None
    );

    item.fsPath = entry.fsPath; // used by the remove/reveal commands
    item.resourceUri = uri;
    item.contextValue = "favorite";
    item.tooltip = entry.fsPath;
    // Show the parent folder as the description to disambiguate equal names.
    item.description = vscode.workspace.asRelativePath(
      path.dirname(entry.fsPath)
    );

    if (entry.type === "folder") {
      item.iconPath = vscode.ThemeIcon.Folder;
      // Clicking a folder => reveal/expand it in the native Explorer.
      item.command = {
        command: "revealInExplorer",
        title: "Reveal in Explorer",
        arguments: [uri],
      };
    } else {
      item.iconPath = vscode.ThemeIcon.File;
      // Clicking a file => open it in the editor.
      item.command = {
        command: "vscode.open",
        title: "Open File",
        arguments: [uri],
      };
    }

    return item;
  }
}

function deactivate() {}

module.exports = { activate, deactivate };
