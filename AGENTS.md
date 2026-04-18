# GIRIN Codex Rules

## Obsidian Path Conversion

When the user pastes an Obsidian copied link/path that starts with:

```text
50_開発/GIRIN/
```

immediately treat that prefix as the project-local documentation folder:

```text
doc/
```

If the pasted path has no file extension, append `.md`.

Examples:

- `50_開発/GIRIN/04_制作・実装/Webサイト実装進捗` -> `doc/04_制作・実装/Webサイト実装進捗.md`
- `50_開発/GIRIN/03_詳細設計/コンボカード・フィルタ` -> `doc/03_詳細設計/コンボカード・フィルタ.md`

Do not ask the user to confirm this conversion before reading the file.
