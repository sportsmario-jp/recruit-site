# shops.json スキーマ定義

店舗情報の一元管理用データファイルです。このファイルを編集することで、店舗一覧ページと各店舗詳細ページが自動生成されます。

## トップレベル構造

```json
{
  "shops": [ /* 店舗オブジェクトの配列 */ ],
  "meta": {
    "lastUpdated": "2026-04-09",
    "version": "1.0.0"
  }
}
```

## 店舗オブジェクト構造

各店舗は以下のフィールドを持ちます。

| フィールド | 型 | 必須 | 説明 |
|---|---|---|---|
| `id` | string | ○ | ユニークID（URL用、英数字ハイフン）例: `shimokitazawa` |
| `active` | boolean | ○ | 募集中フラグ。`false` で非表示になる |
| `name` | string | ○ | 店舗名 例: `STAND ON 下北沢店` |
| `brand` | string | ○ | 業態 `standon` / `run-fitness` / `baseball-mario` / `mario-select` |
| `brandLabel` | string | ○ | 業態表示名 例: `STAND ON` |
| `address` | string | ○ | 住所 |
| `access` | string | ○ | アクセス 例: `小田急線下北沢駅 徒歩2分` |
| `phone` | string |  | 電話番号（任意） |
| `businessHours` | string | ○ | 営業時間 |
| `holidays` | string |  | 定休日（任意） |
| `description` | string | ○ | 店舗説明文（2〜3文） |
| `appeal` | string[] | ○ | 店舗の魅力ポイント（配列、3〜5個） |
| `jobs` | Job[] | ○ | 募集職種の配列（1店舗複数職種可） |
| `images` | object | ○ | 画像パス |
| `seo` | object |  | SEOメタ情報（任意） |

## Job オブジェクト（募集職種）

| フィールド | 型 | 必須 | 説明 |
|---|---|---|---|
| `type` | string | ○ | 雇用区分 `fulltime`（正社員）/ `parttime`（アルバイト・パート） |
| `position` | string | ○ | 職種名 例: `店舗販売スタッフ` |
| `salary` | object | ○ | 給与情報 |
| `salary.type` | string | ○ | `monthly`（月給）/ `hourly`（時給）|
| `salary.min` | number | ○ | 最低額（円） |
| `salary.max` | number |  | 最高額（円、任意） |
| `salary.note` | string |  | 備考 例: `経験により応相談` |
| `hours` | string | ○ | 勤務時間 |
| `benefits` | string[] | ○ | 待遇・福利厚生 |
| `requirements` | string[] |  | 応募資格（任意） |

## images オブジェクト

| フィールド | 型 | 必須 | 説明 |
|---|---|---|---|
| `hero` | string | ○ | ヒーロー画像パス 例: `images/shops/shimokitazawa-hero.jpg` |
| `gallery` | string[] |  | ギャラリー画像パス配列（任意） |

## seo オブジェクト

| フィールド | 型 | 説明 |
|---|---|---|
| `title` | string | ページタイトル（省略時は自動生成） |
| `description` | string | メタ説明文（省略時は `description` から自動生成） |

## brand 値の一覧

| 値 | 表示名 | 業態 |
|---|---|---|
| `standon` | STAND ON | スポーティーファッション |
| `run-fitness` | RUN & FITNESS | ランニング・フィットネス |
| `baseball-mario` | BASEBALL MARIO | 野球専門店 |
| `mario-select` | MARIO SELECT | セレクトショップ / EC |

## 編集時の注意

1. **JSONの構文を壊さない**：カンマ、クォート、ブラケットに注意
2. **`id` は変更しない**：URLに使われるため、変更するとリンク切れが発生
3. **画像ファイルを先に配置**：`images/shops/` に配置してからパスを記述
4. **編集後は `npm run build`** でHTML自動生成（またはClaude Codeに依頼）
