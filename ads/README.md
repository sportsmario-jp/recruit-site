# Meta広告クリエイティブ（2027年卒新卒採用 / ストーリー用）

## 完成素材

| ファイル | テーマ | メインメッセージ |
|---|---|---|
| `output/ad-A-main-story.jpg` | メインメッセージ | 好きを仕事に、好きを武器に。 |
| `output/ad-B-seminar-story.jpg` | WEB会社説明会誘導 | まずは話を聞いてみる。 |

- サイズ: 1080×1920（9:16 ストーリーズ・リール用）

## 配信時の設定

### 遷移先URL

**ad-A（メインメッセージ）**:
```
https://recruit.sportsmario.co.jp/graduate.html?utm_source=facebook&utm_medium=cpc&utm_campaign=2027graduate&utm_content=main
```

**ad-B（説明会）**:
```
https://recruit.sportsmario.co.jp/graduate.html?utm_source=facebook&utm_medium=cpc&utm_campaign=2027graduate&utm_content=seminar
```

### 広告コピー

#### ad-A（メインメッセージ）
- **本文**: スポーツとファッションの専門家として、自分自身のファンをつくる仕事。SMSAなら「好き」がそのまま強みになります。2027卒、新卒採用エントリー受付中。
- **見出し**: 好きを仕事に、好きを武器に。
- **CTAボタン**: 詳しくはこちら

#### ad-B（説明会）
- **本文**: 「採用情報をちょっと聞いてみたい」「業態の違いを知りたい」──そんな方へ。毎週水曜15:00、オンラインでカジュアルにお話しできるWEB会社説明会を開催中です。服装自由、顔出し任意、所要60分。
- **見出し**: 毎週水曜 WEB会社説明会
- **CTAボタン**: 登録する

### 推奨ターゲティング
- 年齢: 21〜25歳
- 地域: 全国
- 興味関心: ファッション / ランニング / フィットネス / アパレル販売 / スポーツ用品
- 配置: Instagram & Facebook **ストーリーズ・リール**

## 編集 & 再生成

`templates/ad-A-template.html` または `ad-B-template.html` を編集して、以下を実行:
```bash
cd C:\recruit-mock
node ads/render-ads.js
```
→ `output/ad-A-main-story.jpg` と `ad-B-seminar-story.jpg` が再生成される
