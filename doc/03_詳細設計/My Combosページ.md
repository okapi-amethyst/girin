# My Combosページ 詳細設計

> 対象URL: `/mycombo/`
> 実装状況: Phase 1 — サンプルコンボ表示（静的）/ Phase 2 — ブックマーク機能
> 最終更新: 2026-04-05

---

## Phase 1 設計

### ページ概要

ブックマーク機能は未実装のため、Phase 1 では Fuse別ページと同様のサンプルコンボ一覧を表示する静的ページとして実装する。
ナビゲーション（ヘッダー・各ページの導線）からのリンクは **Phase 1 では設置しない**。URL を直接入力したユーザーのみアクセスできる状態にとどめる。

### コンポーネント構成（Phase 1）

```
mycombo/index.astro
└── Base.astro
    └── .container.page
        ├── nav.breadcrumb（トップ / My Combos）
        ├── header（Phase 2 告知バナー）
        └── section.combo-area
            ├── div.combo-list
            │   └── ComboCard × n（サンプルコンボ）
            └── nav.pagination
```

### Phase 1 の表示内容

- **コンボ一覧:** 既存のサンプルコンボ（`src/data/sample-combos.ts` / `ahri.json` 等）を使用
- **レイアウト:** Fuse別ページのコンボエリアと同じ構成（ComboCard + ページング）
- **フィルター:** なし（サンプルデータのため不要）
- **告知バナー:** 「このページは開発中です。ブックマーク機能は今後実装予定です。」程度のメッセージ

---

## Phase 2 設計

### ページ概要

ユーザーがブックマークしたコンボを一覧表示する。データはローカルストレージに保存し、サーバーサイドは不要。

### コンポーネント構成（Phase 2）

```
mycombo/index.astro
└── Base.astro
    └── .container.page
        ├── nav.breadcrumb
        ├── header
        │   ├── h1「My Combos」
        │   └── ツールバー（エクスポート / インポート）
        └── section.combo-area
            ├── div.combo-list
            │   └── ComboCard × n（ブックマーク済みコンボ）
            └── div.combo-empty（ブックマークなし時）
```

### Phase 2 の機能

- ブックマーク済みコンボを `ComboCard` で表示
- エクスポート: ブックマークデータを JSON ファイルでダウンロード
- インポート: JSON ファイルからブックマークを復元
- 削除: カードのブックマークボタンでブックマーク解除
- データ: `localStorage` に `{ comboId, pairSlug, fuseSlug }[]` を保存

---

## ナビゲーションへの掲載方針

| フェーズ | ヘッダーリンク | 各ページ Coming Soon 導線 |
|---|---|---|
| Phase 1 | **なし** | **なし**（既存の Coming Soon リンクも除去）|
| Phase 2 | 追加 | 追加 |

---

## 課題・検討事項

### Phase 1 のサンプルコンボ選定

- 全サンプルコンボをそのまま表示するか、代表コンボに絞るかの方針が未定
- 「My Combos っぽさ」を出すために、Ahri×Yasuo のコンボを数件表示する程度が適切か

### ブックマークデータの識別

- Phase 2 でコンボを識別するキーをどうするか（`comboId` のみ / `pairSlug + fuseSlug + comboId` の組み合わせ）
- 静的生成のためコンボデータはクライアントが持つか、ページ側でコンボデータの全量を埋め込むか
