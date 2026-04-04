# CODEX TASK — 2XKO GIRIN 設計変更実装

## このドキュメントの目的

2026-03-31 の設計レビューで確定した変更をコードに反映する。
タスク一覧と仕様をここに集約している。不明点はコード内のコメントや下記の参照先ファイルを確認すること。

## 作業方針

- **デプロイは行わない。** ローカル環境で実装・動作確認するところまでが本タスクの範囲。
- 全タスク完了後、**変更サマリーを出力**する（後述の「完了時の出力形式」を参照）。
- ローカル確認コマンド: `npm run dev`（`http://localhost:4321/girin/` で確認）
- ビルドエラーがないかも確認: `npm run build`

---

## プロジェクト概要（最低限の文脈）

- **Astro + TypeScript（Strict）** による静的サイト
- デプロイ先: GitHub Pages（`https://okapi-amethyst.github.io/girin/`）
- ベースURL: `/girin/` （`astro.config.mjs` の `base` を参照）
- 2XKO というゲームのコンボ情報サイト。ログイン不要、閲覧メイン

### 主要ファイル（まず読むこと）

| ファイル | 内容 |
|---|---|
| `src/data/sample-combos.ts` | `ComboData` 型定義 + サンプルデータ |
| `src/data/characters.ts` | キャラクターマスター |
| `src/pages/[char1]/[char2]/[...fuse].astro` | ペア×Fuseページ（フィルタ・コンボ一覧の主戦場） |
| `src/pages/index.astro` | トップページ |
| `src/layouts/Base.astro` | 共通レイアウト（ヘッダー・フッター含む） |
| `src/components/ComboCard.astro` | コンボカードコンポーネント |
| `src/pages/[slug]/index.astro` | キャラソロページ |
| `src/pages/random.astro` | 削除対象 |

---

## タスク一覧

以下をすべて実装すること。依存関係がある場合は番号順に進めること。

---

### TASK-01: `/random/` ページを削除

**対象ファイル:** `src/pages/random.astro`

ファイルを削除する。
このページへのリンクが他のファイルにあれば合わせて削除または差し替える（後述の TASK-05 でヘッダーを更新するので、そこでも整合を取ること）。

---

### TASK-02: `ComboData` 型の更新

**対象ファイル:** `src/data/sample-combos.ts`

以下の変更を型定義に反映する。

#### (a) `starter` enum を確定版に更新

```typescript
// 旧値（現在のコードを確認して置き換え）
// 新値:
type Starter = 'ground' | 'anti_air' | 'throw' | 'pressure_mixup' | 'counter_hit';
```

#### (b) `tags` enum を確定版に更新

```typescript
// 新値:
type Tag = 'oki' | 'corner_carry' | 'side_switch' | 'fury' | 'hkd' | 'limit_strike' | 'crossup' | 'punish';
```

#### (c) `recommended` フラグを追加

```typescript
interface ComboData {
  // ... 既存フィールド ...
  recommended?: boolean;  // トップ表示・おすすめ表示用フラグ
}
```

サンプルデータも型変更に合わせて更新すること（型エラーを消す）。

---

### TASK-03: フィルタ状態をURLクエリパラメータに反映

**対象ファイル:** `src/pages/[char1]/[char2]/[...fuse].astro`

フィルタの状態（難易度・始動・位置・その他）をURLクエリパラメータに反映する。

#### 仕様

- フィルタ変更時に `history.pushState` または `history.replaceState` でURLを更新
- パラメータ例: `?difficulty=3&position=corner&starter=ground`
- ページロード時にクエリパラメータを読み取ってフィルタの初期値に反映
- 複数選択可能なフィルタ（難易度など）は `,` 区切りまたは複数パラメータで表現（現コードの実装スタイルに合わせること）

#### Fuseタブとの連携（TASK-04 と関連）

Fuseタブ切替時にフィルタパラメータを引き継ぐこと（TASK-04 参照）。

---

### TASK-04: Fuseタブ切替時にフィルタパラメータを引き継ぐ

**対象ファイル:** `src/pages/[char1]/[char2]/[...fuse].astro`

Fuseタブのリンクを生成する際、現在のURLのクエリパラメータをそのまま引き継いだURLを生成する。

#### 仕様

- タブリンクは静的HTML（Astroのビルド時生成）なので、クライアントJSでタブリンクのhrefを動的に書き換える
- ページロード時とフィルタ変更時に、Fuseタブ全リンクのhrefにクエリパラメータを付与する

---

### TASK-05: ヘッダー更新

**対象ファイル:** `src/layouts/Base.astro`

現在のヘッダーを以下の構成に更新する。

#### 新しいヘッダー構成

| 要素 | 詳細 |
|---|---|
| GIRINロゴ | トップページへのリンク（既存） |
| 2XKOバッジ | 既存 |
| My Combos | `Coming Soon` バッジ付き（クリック無効 or `href="#"` で disabled表示） |
| ページシェアボタン | 現在のURLをクリップボードにコピー。コピー後に「コピーしました」などのフィードバックを一時表示 |
| 検索アイコン | プレースホルダー。クリック時は何もしない（または `Coming Soon` tooltip） |
| テーマ切替 | 既存 |

Random Combo リンクは削除する（TASK-01 との整合）。

---

### TASK-06: フッター追加

**対象ファイル:** `src/layouts/Base.astro`

現在フッターがない場合は追加する。

#### フッター構成

```
© 2026 GIRIN | 2XKO GIRIN はファンサイトであり Riot Games とは無関係です
免責事項 / 権利表記  |  プライバシーポリシー  |  [Discord アイコン] サーバーに参加  |  [X アイコン]
```

#### 詳細

- **著作権・免責表記**: `2XKO GIRIN is not endorsed by Riot Games and does not reflect the views or opinions of Riot Games or anyone officially involved in producing or managing 2XKO.`（日本語版も併記可）
- **免責事項 / 権利表記**: 別ページは不要。フッター内にテキスト展開（`<details>` タグ等）でも可
- **プライバシーポリシーリンク**: `/privacy/` へのリンク（ページ未実装でも href だけ置く）
- **Discord 誘導**: アイコン + 「サーバーに参加」テキスト。リンクは `https://discord.gg/` のプレースホルダーでOK（後で差し替え）
- **X（Twitter）アイコン**: リンクはプレースホルダーでOK

---

### TASK-07: ページタイトルフォーマット適用

**対象ファイル:** 各ページ（`index.astro`, `[slug]/index.astro`, `[char1]/[char2]/[...fuse].astro`, `[slug]/juggernaut.astro`）

`<title>` タグのフォーマットを以下に統一する。

| ページ | タイトルフォーマット |
|---|---|
| トップ | `2XKO コンボ集 \| GIRIN` |
| キャラソロ | `{キャラ名} コンボ \| 2XKO GIRIN` |
| ペア×Fuse | `{キャラ1} × {キャラ2} コンボ \| 2XKO GIRIN` |
| ジャガーノート | `{キャラ名} JUGGERNAUT コンボ \| 2XKO GIRIN` |

---

### TASK-08: OG画像の動的生成

**対象ファイル:** `src/pages/[char1]/[char2]/[...fuse].astro`、`src/pages/[slug]/index.astro` 等

Astro の `@vercel/og` または `satori` を使ったOG画像生成、**または** 静的OG画像で代替する。

#### 優先方針

GitHub Pages（静的ホスティング）のため、サーバーサイドでの動的生成は不可。
以下のいずれかで実装すること:

**方針A（推奨）:** ビルド時に各ページのOG画像をPNGとして生成
- Astro の `getStaticPaths` + APIエンドポイント（`.png.ts`）で静的生成
- サイズ: 800×418px
- 内容: キャラアイコン + ペア名（または「全キャラ」） + GIRINロゴ + 背景

**方針B（簡易）:** 共通の静的OG画像1枚（`public/og-default.png`）を全ページで使用
- 工数が少ないが SEO 効果は低い

どちらを選んだかをコメントに明記すること。

#### OGメタタグ（共通）

```html
<meta property="og:title" content="{ページタイトル}" />
<meta property="og:description" content="{キャラ名}のコンボ一覧。難易度・状況でフィルタして自分に合ったコンボを探そう。" />
<meta property="og:image" content="{OG画像URL}" />
<meta property="og:type" content="website" />
<meta name="twitter:card" content="summary_large_image" />
```

---

### TASK-09: コンボ0件時のメッセージ表示

**対象ファイル:** `src/pages/[char1]/[char2]/[...fuse].astro`

フィルタ結果または該当ページのコンボが0件の場合、カード一覧エリアに以下を表示する。

```
まだコンボがありません
このペアのコンボを持っている方は Discord でシェアしてください！
[Discord サーバーに参加する] ボタン
```

Discordリンクは TASK-06 と同じプレースホルダーURL。

---

### TASK-10: コンボ一覧のページング（5件/ページ）

**対象ファイル:** `src/pages/[char1]/[char2]/[...fuse].astro`

コンボ一覧を1ページ5件に制限し、ページング UI を追加する。

#### 仕様

- クライアントサイドのページング（JSで表示/非表示を切り替え）
- `?page=2` でURLに反映（TASK-03 のクエリパラメータと共存させる）
- ページ下部に「前へ」「次へ」ナビゲーション + 現在ページ / 総ページ数表示
- フィルタ変更時はページ1に戻る

---

### TASK-11: Escキーで動画パネルを閉じる

**対象ファイル:** `src/pages/[char1]/[char2]/[...fuse].astro`（またはクライアントJSが書かれている箇所）

既存の動画パネル閉じるロジックに、`keydown` イベントで `Escape` キーを検知して閉じる処理を追加する。

```javascript
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    // 動画パネルを閉じる（既存の閉じる処理を呼ぶ）
  }
});
```

---

### TASK-12: `/recent/` Coming Soon リンクをトップページ/ヘッダーに配置

**対象ファイル:** `src/pages/index.astro`、`src/layouts/Base.astro`

新着コンボページ `/recent/` は Phase 2 実装予定。現時点では Coming Soon として導線だけ作る。

#### 仕様

- トップページのナビリンク（既存の Random Combo があった箇所、または新規追加）に「New Arrivals」または「新着コンボ」を `Coming Soon` バッジ付きで追加
- クリック時は何もしない（disabled）

---

### TASK-13: フィルタリングロジック実装

**対象ファイル:** `src/pages/[char1]/[char2]/[...fuse].astro`

現在フィルターバーはUI表示のみ。実際にコンボカードを絞り込む処理を実装する。

#### フィルタ項目と対応する `ComboData` フィールド

| フィルタUI | `ComboData` フィールド | 備考 |
|---|---|---|
| 難易度チップ（★1〜★5） | `difficulty` | 複数選択可。選択なし = 全件 |
| 始動 | `starter` | TASK-02 で更新した enum 値を使う |
| 位置 | `position` | |
| アシスト使用 | `assist_used` | |
| 交代 | （`tags` または専用フィールド） | 現コード確認して合わせる |
| DUO限定 | `duo_only` | |
| ゲージ使用 | `ult_gauge_point` または `ult_gauge_assist` | どちらかが > 0 で true |

#### 実装方針

- クライアントJS（`<script>` タグ内）でフィルタ状態を管理
- 各フィルタ変更時にカード一覧を再描画（DOMの show/hide で可）
- TASK-03（URLパラメータ反映）と組み合わせて実装

---

### TASK-14: ソート機能実装

**対象ファイル:** `src/pages/[char1]/[char2]/[...fuse].astro`

フィルターバーの「並び順」セレクターを実際に機能させる。

#### ソート種別

| 表示名 | ソートキー | 詳細 |
|---|---|---|
| 実用度順（デフォルト） | `practicality` | 降順 |
| ダメージ順 | `damage` | 降順 |
| 難易度順（易しい順） | `difficulty` | 昇順 |
| 難易度順（難しい順） | `difficulty` | 降順 |

---

## 実装しないこと（スコープ外）

以下は **このタスクでは実装しない**。着手しないこと。

- My Combos（LocalStorage ブックマーク）
- コンボ投稿フォーム
- Discord Bot 連携
- 実コンボデータの投入
- `/recent/` ページの本格実装（Coming Soon リンクのみ）
- DB化・認証
- プライバシーポリシーページの本文作成

---

## 実装上の注意

1. **ベースURL**: リンクやアセットパスは必ず `import.meta.env.BASE_URL` を使う（ハードコードしない）
2. **TypeScript Strict**: 型エラーが出たら回避せず正しく型付けする
3. **静的サイト**: サーバーサイド処理は使えない。すべてビルド時生成またはクライアントJS
4. **既存スタイル**: CSS変数（`var(--color-*)` 等）を使い、インラインスタイルは最小限に
5. **コミットしない**: 実装はローカルに留める。コミット・プッシュ・デプロイは行わない（オーナーが内容を確認してから行う）
6. **ビルド確認**: 各タスク完了後に `npm run build` でエラーがないことを確認する

---

## 完了時の出力形式

全タスク完了後、以下の形式で変更サマリーを出力すること。
オーナーがローカルで確認・承認した後にデプロイを行う。

```
## 変更サマリー

### 完了タスク
- TASK-XX: {タスク名} — {変更ファイル}
- ...

### 変更ファイル一覧
- src/xxx.astro : {変更内容の一言メモ}
- ...

### 未完了・要確認事項
- {あれば記載。なければ「なし」}

### ローカル確認手順
1. `npm run dev` を起動
2. {確認すべき画面・操作を列挙}
```

---

## 完了チェックリスト

- [x] TASK-01: `/random/` 削除
- [x] TASK-02: 型定義更新（starter / tags / recommended）
- [x] TASK-03: フィルタ → URLパラメータ反映
- [x] TASK-04: Fuseタブ切替でパラメータ引き継ぎ
- [x] TASK-05: ヘッダー更新
- [x] TASK-06: フッター追加
- [x] TASK-07: ページタイトルフォーマット統一
- [x] TASK-08: OG画像・OGメタタグ
- [x] TASK-09: コンボ0件メッセージ
- [x] TASK-10: ページング（5件/ページ）
- [x] TASK-11: Escキーで動画パネルを閉じる
- [x] TASK-12: `/recent/` Coming Soonリンク
- [x] TASK-13: フィルタリングロジック実装
- [x] TASK-14: ソート機能実装

## 補足・要確認事項

- `ahri/yasuo` は検証用の個別ページとして維持している。汎用ページと競合するが、Astro の優先順位により専用ルートが使われるため意図どおり。
- `npm run build` は通過済み。既知の警告は `/ahri/yasuo/[...fuse]` が `/[char1]/[char2]/[...fuse]` より優先される件のみ。
- TASK-08 の OG 画像は方針Bで実装し、共通画像 `public/og-default.png` を使用している。
