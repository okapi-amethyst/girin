# Webサイト実装進捗

> Step = Webサイト開発のマイルストーン。プロジェクト全体の Phase（0〜3）とは別。
> Phase 定義は `PROJECT_PROMPT.md` を参照。

## 環境・デプロイ情報

- リポジトリ: https://github.com/okapi-amethyst/girin
- 公開URL: https://okapi-amethyst.github.io/girin/
- スタック: Astro + TypeScript Strict / GitHub Pages（GitHub Actions 自動デプロイ）
- ローカル確認: `npm run dev` → `http://localhost:4321/girin/`

---

## Step 1: 開発環境 & デプロイ基盤（完了）

- Astro プロジェクト作成、TypeScript Strict、`@astrojs/sitemap` 導入
- GitHub Pages + Actions による自動デプロイ構築

## Step 2: サイト構造 & ページ生成（完了）

計496ページを静的生成。

| ページ種別 | パス | 備考 |
|---|---|---|
| トップ | `/` | |
| キャラソロ | `/[slug]/` × 13 | |
| ジャガーノート | `/[slug]/juggernaut/` × 13 | |
| ペア×Fuse | `/[char1]/[char2]/[fuse]` × 468 | 78ペア × 6Fuse |
| ~~ランダムコンボ~~ | ~~`/random/`~~ | 廃止。`/recent/` は Phase 2 |

## Step 3: UIコンポーネント & 機能実装（完了）

- 全ページのレイアウト・コンポーネント実装
- フィルタリング / ソート / URLパラメータ反映
- ページング（5件/ページ）
- ヘッダー更新（Share / My Combos Coming Soon / 検索プレースホルダー）
- フッター追加（著作権・免責・Discord・X）
- OGメタタグ + 共通OG画像（`public/og-default.png`）
- コンボ0件メッセージ + Discord誘導
- Escキーで動画パネルを閉じる

---

## 残タスク

### Phase 1（リリース前）
- [ ] モバイル横向き対応（動画 60dvh + 入力表記。`landscape and max-height: 500px`）

### Phase 2 以降
- [ ] 実コンボデータの投入
- [ ] My Combos（LocalStorage ブックマーク）
- [ ] コンボ投稿フォーム（Web版）
- [ ] `/recent/` 新着コンボページ本格実装
- [ ] practicality / ult_gauge 自動算出ロジック
- [ ] DB化 + 認証・投稿管理（Supabase）
- [ ] Discord Bot 連携
