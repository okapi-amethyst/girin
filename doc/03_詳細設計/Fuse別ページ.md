# Fuse別ページ 詳細設計

> 対象URL: `/[char1]/[char2]/[fuse]/`
> 対象Fuse: `double-down` / `2x-assist` / `freestyle` / `sidekick` / `sidekick-alt`
> 実装ファイル: `src/components/PairComboPage.astro` / `src/scripts/pair-combo-page.ts` / `src/components/ComboCard.astro`
> 最終更新: 2026-04-05

---

## ページ概要

特定ペア × 特定Fuseのコンボ一覧を表示するページ。フィルタ・ソート・ページングでコンボを絞り込み、動画パネルで再生確認できる。

ペアトップページ（`/[char1]/[char2]/`）と同じコンポーネント（`PairComboPage.astro`）を共有しているが、**Fuse別ページとしての詳細設計はこのドキュメントで管理する**。

---

## コンポーネント構成

```
PairComboPage.astro
├── Base.astro（レイアウト: ヘッダー・フッター）
└── .container.page（max-width: 960px, padding: 0 1rem）
    ├── nav.breadcrumb            ← パンくずナビ
    ├── header.pair-header        ← ペアヘッダー
    ├── div.pair-nav-links        ← キャラ単体ページへのリンク
    ├── nav.fuse-nav              ← Fuseタブ（ALL + 各Fuse）
    ├── div.headroom-nav          ← スクロール時fixed表示ナビ（position: fixed）
    ├── div.filter-bar            ← フィルターバー
    │   ├── div.filter-row        ← 常時表示フィルター行
    │   │   ├── .filter-group（難易度チップ）
    │   │   ├── .filter-group（始動チップ）
    │   │   ├── .filter-group（位置チップ）
    │   │   ├── .filter-group（ソートドロップダウン）
    │   │   └── button.expand-toggle（「その他 ▼」）
    │   └── div.filter-panel（展開パネル・初期非表示）
    │       ├── .filter-row（トグル: アシスト / 交代 / DUO）
    │       └── .filter-row-wide（Pゲージ / Aゲージ / タグチップ）
    └── div.content-layout
        ├── div.video-panel       ← 動画パネル（初期非表示, position: sticky）
        │   └── .vp-inner
        │       ├── .vp-player（YouTube iframe 16:9）
        │       └── .vp-info（メタ情報 + ×ボタン + 入力表記）
        └── section.combo-area
            ├── div.combo-list    ← ComboCard の一覧
            │   └── ComboCard.astro × n
            ├── div.combo-empty   ← 0件時メッセージ
            └── nav.pagination    ← ページング（前へ / n/N / 次へ）
```

---

## 各コンポーネント詳細

### パンくずナビ（`nav.breadcrumb`）

```
トップ
```

- 現状はトップリンクのみ。キャラ単体ページへのリンクは **pair-nav-links で別途設置**されている。
- **課題:** Fuse別ページには「トップ > キャラ名 > FUSE名」の3段パンくずが設計上は正しい（`サイト構造設計.md` Juggernautページの記述参照）が、現状ペアページとJuggernautページで統一されていない。

---

### ペアヘッダー（`header.pair-header`）

| 要素 | 内容 |
|---|---|
| `.pair-icons` | 2キャラのアイコン（48px丸型）+ `×` テキスト |
| キャラアイコン | キャラ画像（600px-{slug}.png）を `background-image` + `background-position/size` でクロップ |
| フォールバック | 画像なし時: 名前の頭文字を表示 |
| `.pair-names h1` | `キャラA名 × キャラB名`（font-size: 1.3rem） |
| `.fuse-current-label` | 現在のFuse名（accent色, uppercase, letter-spacing）|
| `.sidekick-dir` | Sidekick系のみ: 始動キャラ方向 `(AhriがPointe…)` を追記 |

---

### キャラ単体ページリンク（`div.pair-nav-links`）

```
[charA.nameJa] のペアを探す  [charB.nameJa] のペアを探す
```

- font-size: 0.75rem、破線アンダーライン
- `/[charA.slug]/` と `/[charB.slug]/` にリンク
- **位置:** ヘッダー直下、Fuseタブの上

---

### Fuseタブナビ（`nav.fuse-nav`）

```
[ ALL ] [ Double Down ] [ 2X Assist ] [ Freestyle ] [ Sidekick (Ahri始動) ] [ Sidekick (Yasuo始動) ]
```

| 状態 | スタイル |
|---|---|
| 非アクティブ | border: color-border, color: text-muted, bg: surface |
| アクティブ | border/color: accent, bg: accent 10% mix |

- `flex-wrap: wrap`（多い場合は折り返し）
- Sidekick系チップには始動キャラ名を `fuse-chip-sub`（0.55rem）で付記
- **フィルタ引き継ぎ:** タブ切替時に現在のクエリパラメータ（フィルタ状態）をリンクに引き継ぐ（`syncUrl()`内で処理）

---

### Headroom ナビ（`div.headroom-nav`）

- `position: fixed; top: 0; z-index: 200`
- スクロールダウン時 + フィルターバーが画面外に出たとき表示（`transform: translateY(0)`）
- スクロールアップ時 or フィルターが見えているとき非表示
- 表示内容: `キャラA × キャラB [FUSE名]`（小さいテキスト）
- 動画パネルの `top` 値と連動（34px ずらす）

---

### フィルターバー（`div.filter-bar`）

**常時表示行:**

| フィルター | UI | 値 |
|---|---|---|
| 難易度 | チップ（★1〜★5）| 1〜5。★1/★2 は `PULSE` バッジ付き |
| 始動 | チップ | ground / anti_air / counter_hit / throw / pressure_mixup |
| 位置 | チップ | center / corner |
| 並び順 | `<select>` | practicality-desc（デフォルト）/ damage-desc / difficulty-asc / difficulty-desc |
| その他 ▼ | トグルボタン | 展開パネルの開閉 |

**展開パネル（`div.filter-panel`）:**

| フィルター | UI | データ属性 |
|---|---|---|
| アシスト使用 | checkbox | `assist_used` |
| 交代 | checkbox | `tag` |
| DUO限定 | checkbox | `duo_only` |
| Pゲージ | `<select>` (全て/0/1+) | `ult_gauge_point` |
| Aゲージ | `<select>` (全て/0/1+) | `ult_gauge_assist` |
| タグ | チップ複数選択 | oki / corner_carry / side_switch / hkd / limit_strike |

**URLクエリパラメータへの反映:**
- 全フィルタ・ソート・ページ番号をクエリに反映（`history.replaceState`）
- デフォルト値はクエリに含めない（`practicality-desc` ソートは省略、page=1 は省略）

---

### 動画パネル（`div.video-panel`）

**レイアウト（現状: モバイル構成のみ）:**

```
[ 動画パネル (sticky, top: 0 or 34px) ]
  └── .vp-inner（縦並び）
      ├── .vp-player（16:9 iframe, width: 100%）
      └── .vp-info
          ├── .vp-meta: [#ID ★★★☆☆ 1234 dmg]  [×]
          └── .vp-inputs: <code>入力表記（全表記・monospace）</code>
```

**挙動:**

| アクション | 結果 |
|---|---|
| コンボカード本体クリック（動画未表示）| 対象カードの動画を開く |
| コンボカード本体クリック（動画表示中）| 動画を閉じる |
| ▶ ボタンクリック | 動画を開く / 同じカードなら閉じる |
| 別カードの ▶ ボタン | 動画を差し替え（iframeのsrcを更新） |
| × ボタン / Esc キー | 動画を閉じ、`iframe src` をリセット（再生停止） |
| カード外クリック（動画表示中）| 動画を閉じる |
| 動画パネル内クリック | 閉じない（バブリングを止める） |

**再生中のカード状態:**
- `playing` クラスを付与 → border-color: accent

**PC 2カラムレイアウト（未実装・設計検討中）:**
- 840px 以上: 左にカード一覧（480px固定）、右にサイドバー（動画パネル + フィルター）を sticky 配置
- 詳細は [課題・検討事項] を参照

---

### ComboCard

```
article.combo-card（クリック可, border-radius: 8px）
├── .cc-header
│   ├── .cc-difficulty（★表示 + PULSEバッジ）
│   ├── .cc-damage（ダメージ数値, font-weight: 800, margin-left: auto）
│   └── .cc-id（#ID, 薄いグレー）
├── .cc-badges（始動 / 位置 / 交代 / Assist / DUO / Pゲージ / Aゲージ）
├── .cc-inputs-wrap
│   ├── .cc-inputs.cc-inputs-short（短縮表記, 初期表示）
│   ├── .cc-inputs.cc-inputs-full（全表記, 初期非表示）
│   └── button.cc-expand-btn（「全表記」/ 5手超の場合のみ）
├── .cc-tags（起き攻め / 端運び / etc. タグ）
├── p.cc-notes（メモ・注記、任意）
└── .cc-footer
    ├── .cc-credit（投稿者名 / 考案者名）
    └── .cc-actions
        ├── リンクコピーボタン（クリップボードコピー）
        ├── ▶ 動画ボタン（.cc-video-btn）
        └── ブックマークボタン（現状 disabled）
```

**バッジの色分け:**

| バッジ | 色 |
|---|---|
| 始動 | accent（黄緑系） |
| 位置 | `#60a5fa`（青） |
| 交代 | `#a78bfa`（紫） |
| Assist | `#fb923c`（オレンジ） |
| DUO | `#f472b6`（ピンク） |
| ゲージ | `#38bdf8`（水色） |

**入力表記の短縮ルール:**
- 5手以内: 全表示
- 6手以上: `先頭2手 > ... > 末尾2手` で短縮 + 「全表記」ボタン

---

### 空件・ページング

**0件時（`div.combo-empty`）:**
```
まだコンボがありません
このペアのコンボを持っている方は Discord でシェアしてください！
[Discord サーバーに参加する]
```

**ページング（`nav.pagination`）:**
- PAGE_SIZE: 5件/ページ
- `[前へ]  n / N  [次へ]` 形式
- 1ページのみの場合は非表示（`display: none`）

---

## 状態管理（`pair-combo-page.ts`）

| 状態 | 型 | 説明 |
|---|---|---|
| `difficulty` | `Set<string>` | 複数選択可 |
| `starter` | `Set<string>` | 複数選択可 |
| `position` | `Set<string>` | 複数選択可 |
| `tags` | `Set<string>` | 複数選択可（OR条件）|
| `assist_used` | `boolean` | |
| `tag` | `boolean` | |
| `duo_only` | `boolean` | |
| `ult_gauge_point` | `string` | `''` / `'0'` / `'1'` |
| `ult_gauge_assist` | `string` | `''` / `'0'` / `'1'` |
| `sort` | `string` | `practicality-desc`（default）|
| `page` | `number` | 1-indexed |

**フィルター処理:** クライアントサイドで全カードの `data-*` 属性を読み取り、表示/非表示を切り替える（SSGの静的ページ、サーバーサイドフィルタなし）

---

## デザイントークン（`global.css` より）

| トークン | ダーク | ライト |
|---|---|---|
| `--color-bg` | `#0a0a0f` | `#f5f5f5` |
| `--color-surface` | `#14141f` | `#ffffff` |
| `--color-border` | `#2a2a3a` | `#d8d8e0` |
| `--color-text` | `#e8e8f0` | `#1a1a2e` |
| `--color-text-muted` | `#8888a0` | `#6b6b80` |
| `--color-accent` | `#cdf564` | `#5a8a00` |
| `--color-danger` | `#ff4655` | `#d63040` |

---

## 広告配置（要検討 / Phase 2〜）

> **このページはユーザーが最も長く滞在するコア体験ページ。広告位置の誤りが UX を大きく損なう。** 他ページより慎重に決定すること。

### 禁止エリア（絶対に広告を置かない）

| エリア | 理由 |
|---|---|
| `div.headroom-nav`（fixed）の上下 | スクロール時に fixed 要素と重なり操作不能になる |
| `div.video-panel`（sticky）の近傍 | 動画視聴体験を直接妨害する |
| `div.filter-bar` の内部・直上 | フィルター操作の邪魔になる |
| `.combo-list` の途中（カード間） | コンボカードと誤認・コンボ流し読みを妨害する |

### 候補位置

| # | 位置 | セクション間の区切り |
|---|---|---|
| ① | `nav.pagination` の下（コンボリスト読み切り後） | ページング ↓ **[広告]** ↓ フッター |
| ② | `div.filter-bar` の上（Fuse タブ下）※慎重 | Fuse タブ ↓ **[広告]** ↓ フィルターバー |
| ③（PC 2カラム実装後） | 右サイドバーの動画パネル下 | 動画パネル ↓ フィルターバー ↓ **[広告]** |

### モバイル（〜839px）

| 候補 | 推奨サイズ | 備考 |
|---|---|---|
| ① | `300×250` または Responsive | **最優先**。ページを最後まで読んだユーザーにのみ表示。UX 影響が最小 |
| ② | `320×50`（Mobile Banner）または Responsive | フィルター前のごく薄い区切りとして許容範囲内だが、CTR よりも邪魔度が先に上がる可能性あり。A/B テストで判断 |

- **①だけを先に導入**し、収益が安定してから②の検討を推奨。

### PC（840px〜、2カラムレイアウト実装後）

| 候補 | 推奨サイズ | 備考 |
|---|---|---|
| ③ | `300×250`（Medium Rectangle） | 右サイドバーに収まる最適サイズ。動画を閉じているときにフィルター下に表示 |
| ③ | `300×600`（Half Page） | 動画パネルが閉じていて右サイドバーに余白が大きい場合。ただし画面占有率が高くなるため要判断 |

- 動画パネルが開いたとき広告が押し下げられるかどうか（sticky の扱い）を実装時に確認すること。
- 2 カラムレイアウト実装前は PC もモバイルと同じ①を使用する。

---

## 課題・検討事項

### PC 2カラムレイアウト（未実装）

- **設計意図:** 840px 以上では左にカード一覧、右に動画パネル + フィルターをサイドバーとして並べる
- **現状:** 全幅の縦並びのみ（モバイル構成をそのままPCで使用）
- **課題:** `.content-layout` に `@media (min-width: 840px)` での 2カラム CSS を追加する必要がある

### パンくずの不統一

- Juggernautページは「トップ > キャラ名 > JUGGERNAUT」の設計だが Fuse別ページは「トップ」のみ
- キャラ単体ページへのリンクは pair-nav-links に分離されている（パンくずとして統合するかどうかの方針が未定）

### フィルターのパーシャルリセット

- Fuseタブを切り替えてもフィルタが引き継がれる（設計意図通り）
- 一方で「難易度フィルタだけリセットしたい」の操作手段がない
- 全クリアボタンの追加を検討

### ブックマーク機能（未実装）

- `cc-bookmark-btn` は `disabled` 状態のプレースホルダー
- Phase 2: ローカルストレージへの保存 + My Combos ページへの連携

### ゲージフィルターのUI

- 現状: `<select>` で「全て / 0 / 1+」の3択
- 0消費コンボのみ表示 vs. ゲージ使用コンボのみ表示という用途の違いを1つのUIで表現できているか要検討

### タグフィルターの選択肢

- `fury`（フューリー使用）/ `crossup`（めくり）/ `punish`（確反）はデータ上存在するが、フィルターUIには現状含まれていない
- 追加するかどうかの方針が未定
