# 2XKO GIRIN — 作業進捗

> ここでの Step はWeb開発のマイルストーン。プロジェクト全体の Phase（0〜3）とは別。
> プロジェクトPhaseの定義は PROJECT_PROMPT.md を参照。

## Step 1: 開発環境 & デプロイ基盤（完了）

### ローカル環境
- Node.js v24.14.1
- Git 2.53.0

### プロジェクト
- Astro プロジェクトを `D:\Projects\girin` に作成済み
- TypeScript はデフォルトで有効（Strict）
- `@astrojs/sitemap` 導入済み

### GitHub & デプロイ
- リポジトリ: https://github.com/okapi-amethyst/girin
- 公開設定: public
- ブランチ: master
- GitHub Pages 有効（Source: GitHub Actions）
- `.github/workflows/deploy.yml` で自動デプロイ設定済み
- 公開URL: https://okapi-amethyst.github.io/girin/
- `astro.config.mjs` に `site` と `base`（末尾スラッシュ付き）設定済み

---

## Step 2: サイト構造 & ページ生成（完了）

### ページ一覧（計496ページ）

| ページ | パス | 状態 |
|---|---|---|
| トップ | `/` | 実装済み |
| キャラソロ | `/[slug]/` (×13) | 実装済み |
| ジャガーノート | `/[slug]/juggernaut/` (×13) | 実装済み |
| ペア×Fuse | `/[char1]/[char2]/[fuse]` (78ペア × 6Fuse) | 実装済み |
| ~~ランダムコンボ~~ | ~~`/random/`~~ | **廃止**（設計レビューで削除。代わりに `/recent/` をPhase 2で実装） |

### Fuse構成
- ペアページ: ALL / DOUBLE DOWN / 2X ASSIST / FREESTYLE / SIDEKICK / SIDEKICK（ポイントキャラ違いで2つ）
- ソロページ: JUGGERNAUT（`/[slug]/juggernaut/`に分離）

### ルーティング
- `[char1]/[char2]` のペア順序はキャラマスターID昇順で固定
- `[...fuse]` rest params で Fuse別URLを生成（空 = ALL）
- `getStaticPaths()` 内に FUSE_SLUGS を定義（スコープ制約対応）

---

## Step 3: UI コンポーネント実装（完了）

### 共通レイアウト (`Base.astro`)
- ダークテーマベース
- CSS変数によるカラーシステム
- ヘッダー: GIRIN ロゴ + 2XKO バッジ + テーマ切替

### トップページ (`index.astro`)
- キャラクター選択グリッド（13キャラ）
- ナビリンク: Random Combo / My Combos (Coming Soon) / Submit Combo (Coming Soon)

### キャラソロページ (`[slug]/index.astro`)
- パートナー選択グリッド
- ジャガーノートリンク（グリッド下に控えめ配置、Fuseアイコン画像付き）
- パンくず: トップ > キャラ名

### ペア×Fuseページ (`[char1]/[char2]/[...fuse].astro`)
- ペア名表示（キャラアイコン + 名前）
- Fuse選択タブ（ALL / DOUBLE DOWN / 2X ASSIST / FREESTYLE / SIDEKICK ×2）
  - SIDEKICK はポイントキャラ名をサブテキストで区別（ALT表記なし）
  - Fuse名はすべて大文字表記
- Collapsible Filter Bar
  - 常時表示: 難易度チップ（★1〜★5、★1-2にPULSEバッジ）/ 始動 / 位置 / 並び順
  - 展開パネル（「その他」ボタン）: アシスト使用 / 交代 / DUO限定 / ゲージ使用
- ペア内ナビ: 「アーリ のペアを探す」「ヤスオ のペアを探す」
- コンボカード一覧（サンプルデータ表示）

### ジャガーノートページ (`[slug]/juggernaut.astro`)
- ソロFuse用の簡易フィルターバー（アシスト/交代/DUOフィルタなし）
- パンくず: トップ > キャラ名 > JUGGERNAUT

### コンボカード (`ComboCard.astro`)
- ヘッダー行: 難易度★ + PULSEバッジ（★1-2） + ダメージ + コンボID
- 状況バッジ行: 始動 / 位置 / 交代 / Assist / DUO / ゲージ消費（色分け済み）
- 入力表記:
  - 6パーツ以上は自動短縮（先頭2 + `...` + 末尾2）
  - 「全表記」ボタンで展開/折りたたみ切替（クライアントJS）
  - 5パーツ以下はそのまま全表示
- 追加タグ: 起き攻め可 / 端運び / 入替え / フューリー使用 / ハードノックダウン / リミットストライク / めくり / 確反用
- 補足メモ
- フッター: 投稿者名 + 考案者名 / リンクコピー / ▶動画ボタン / ブックマーク(disabled)
- カード本体クリックで動画パネル開く（動画未表示時）/ 閉じる（動画表示中）

### インライン動画パネル
- **Headroomナビバー**: フィルターバーが画面外に出た状態で**下スクロール時**に上からスライドインする固定ヘッダー（`position: fixed` + スクロール方向判定）。**上スクロール時は非表示**。ペア名+Fuseラベルを表示し、ページトップに戻れるリンク
  - デザインパターン名: **Scroll-triggered Fixed Header（Headroomパターン）**
  - ヒステリシス付き: フィルタバー表示中は常に非表示、スクロール方向で表示/非表示を切替
- **動画パネル**: YouTube埋め込み + コンボID/難易度/ダメージ + 入力表記コード
  - **全サイズ共通**: `position: sticky; top: 0` で上部全幅固定。DOMはcombo-areaの前に配置
  - Headroom表示中は `top` をHeadroom高さ分ずらす（JSで制御）
  - モバイル横: 動画を `60dvh` に制限し、下部に入力表記・メタ情報を表示（`@media (orientation: landscape) and (max-height: 500px)`）
  - 自動再生あり（`autoplay=1`）、ループあり（`loop=1`）、ミュート維持（`mute=1`）
  - `overscroll-behavior-y: none` でiOSバウンス防止
- **クリック挙動**（イベント委譲 on `document`）:
  - ▶ボタン → 常にそのカードの動画を開く/切替
  - カード本体（ボタン以外）→ 動画未表示なら開く、表示中なら閉じる
  - カード外クリック → 閉じる
  - ×ボタン → 閉じる
- サンプル動画: `https://youtu.be/T8H_tluMRPA`（Ahriパルス M連打コンボ）

---

## データ設計（確定）

### キャラクターマスター
- `CHARACTER_MASTER.md` に13キャラ定義済み
- `src/data/characters.ts` でコード内参照

### コンボデータ (`ComboData` interface)
- 詳細は `PROMPT_COMBO_DATA.md` 参照
- 投稿者が入力する項目と自動導出する項目を分離:
  - 投稿者入力: id, point_character, assist_character, fuse, starter, position, duo_only, inputs, damage, tags, difficulty, video_url, submitter_name, creator_name, notes, target_characters, related_combo_id
  - 自動導出: assist_used（inputsから）, tag（inputsから）, ult_gauge_point（inputsから）, ult_gauge_assist（inputsから）, practicality（複合算出）, pulse（difficulty≤2）

### サンプルデータ
- `src/data/sample-combos.ts`: Ahri×Yasuo の5コンボ（難易度1〜5）
- `src/data/combos/ahri.json`, `yasuo.json`: ソロコンボ用旧データ

---

## ソースファイル構成

```
src/
├── components/
│   ├── ComboCard.astro        # コンボカードコンポーネント
│   └── PairComboPage.astro    # ペアページ共通コンポーネント（新規）
├── data/
│   ├── characters.ts          # キャラクターマスターデータ
│   ├── sample-combos.ts       # サンプルコンボデータ + ComboData型定義
│   ├── pair-page.ts           # ペアページ用データ・ヘルパー（新規）
│   └── combos/
│       ├── ahri.json          # ソロコンボ用（旧形式）
│       └── yasuo.json
├── layouts/
│   └── Base.astro             # 共通レイアウト（ヘッダー・フッター更新済み）
├── pages/
│   ├── index.astro            # トップページ
│   ├── [slug]/
│   │   ├── index.astro        # キャラソロページ
│   │   └── juggernaut.astro   # ジャガーノートページ
│   ├── [char1]/
│   │   └── [char2]/
│   │       └── [...fuse].astro # ペア×Fuseページ（フィルタ・ページング・ソート実装済み）
│   └── ahri/                  # 検証用個別ページ（汎用ページより優先される）
├── scripts/                   # クライアントサイドスクリプト（新規）
└── styles/
    └── global.css             # グローバルスタイル
```

---

## 設計レビュー（2026-03-31 実施）で確定した変更

サイト構造設計.md の全面改訂に伴う変更点。実装への反映が必要。

### 設計変更（実装完了 — 2026-04-05）
- [x] `/random/` ページを削除（廃止）
- [x] フィルタ状態をURLクエリパラメータに反映（`?difficulty=3&position=corner` 等）
- [x] Fuseタブ切替時にフィルタパラメータを引き継ぐ
- [x] コンボ一覧を5件/ページに変更（ページ下部に誘導リンク + 次ページ導線）
- [x] ヘッダー更新: My Combos（Coming Soon）/ ページシェアボタン / 検索アイコン（プレースホルダー）
- [x] フッター追加: 著作権表示 / 免責・権利表記 / プライバシーポリシーリンク / Discord誘導 / X アイコン
- [x] OG画像: 共通静的画像 `public/og-default.png`（方針B） + OGメタタグ全ページ対応
- [x] ページタイトルフォーマット適用（例: `アーリ × ヤスオ コンボ | 2XKO GIRIN`）
- [x] コンボ0件ページに「まだコンボがありません」+ Discord誘導メッセージ
- [x] Escキーで動画パネルを閉じる
- [x] starter enum値を確定版に更新: ground / anti_air / throw / pressure_mixup / counter_hit
- [x] tags enum値を確定版に更新: oki / corner_carry / side_switch / fury / hkd / limit_strike / crossup / punish
- [x] ComboData に `recommended` フラグを追加
- [x] 新着コンボページ `/recent/` の Coming Soon リンクをトップページ or ヘッダーに配置

---

## 未実装・今後の作業

### UI（Phase 1 残り）
- [x] フィルターバーの実際のフィルタリングロジック（TASK-13完了）
- [x] ソート機能の実装（実用度 / ダメージ / 難易度）（TASK-14完了）
- [ ] モバイル横向き対応（動画60dvh + 入力表記表示。landscape and max-height: 500px）

### 機能（Phase 2 以降）
- [ ] My Combos（ブックマーク機能、LocalStorage）
- [ ] コンボ投稿フォーム（Web版）
- [ ] Discord Bot 連携
- [ ] 実コンボデータの投入
- [ ] practicality 自動算出ロジック実装
- [ ] ult_gauge 自動算出ロジック実装（inputs解析）
- [ ] 新着コンボページ `/recent/` 本格実装（DB連携後）

### インフラ
- [ ] DB化（Phase 2移行時）
- [ ] 認証・投稿管理
