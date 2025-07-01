# ログ設計書

## 概要

本ドキュメントは、Hono Template API プロジェクトにおけるログ出力の設計指針と実装方針を定義します。

## ログレベル

以下のログレベルを使用します：

| レベル  | 用途                                                    | 出力環境     |
| ------- | ------------------------------------------------------- | ------------ |
| `ERROR` | エラー情報（システム異常、例外処理など）                | 全環境       |
| `WARN`  | 警告情報（非推奨機能の使用、リソース不足など）          | 全環境       |
| `INFO`  | 一般的な情報（API 呼び出し、重要な処理の開始/終了など） | 全環境       |
| `DEBUG` | デバッグ情報（詳細な処理状況、変数の値など）            | 開発環境のみ |

## ログフォーマット

### 構造化ログ（JSON 形式）

本番環境では構造化ログ（JSON 形式）を採用します。

```json
{
  "timestamp": "2025-06-30T12:34:56.789Z",
  "level": "INFO",
  "message": "User login successful",
  "service": "hono-template-api",
  "version": "1.0.0",
  "requestId": "req-123abc456def",
  "userId": "user-789xyz",
  "endpoint": "POST /api/auth/login",
  "statusCode": 200,
  "responseTime": 150,
  "userAgent": "Mozilla/5.0...",
  "ip": "192.168.1.100",
  "additional": {
    "custom_field": "custom_value"
  }
}
```

### 開発環境（Human Readable）

開発環境では可読性を重視したフォーマットを使用します。

```
[2025-06-30 12:34:56.789] INFO [req-123abc456def] POST /api/auth/login (200) 150ms - User login successful
```

## ログ出力対象

### 1. HTTP リクエスト/レスポンス

**必須フィールド:**

- タイムスタンプ
- リクエスト ID
- HTTP メソッド
- エンドポイント
- ステータスコード
- レスポンス時間
- IP アドレス
- User-Agent

**任意フィールド:**

- ユーザー ID（認証済みの場合）
- リクエストボディサイズ
- レスポンスボディサイズ

### 2. エラー処理

**必須フィールド:**

- エラーメッセージ
- エラーコード
- スタックトレース（開発環境のみ）
- リクエスト ID

**任意フィールド:**

- ユーザー ID
- 関連するエンティティ ID
- エラー発生時のコンテキスト情報

### 3. データベース操作

**必須フィールド:**

- 操作種別（SELECT, INSERT, UPDATE, DELETE）
- テーブル名
- 実行時間
- リクエスト ID

**任意フィールド:**

- 影響を受けた行数
- クエリパラメータ（機密情報を除く）

### 4. ビジネスロジック

**必須フィールド:**

- 処理名
- 処理結果（成功/失敗）
- リクエスト ID

**任意フィールド:**

- ユーザー ID
- 処理対象のエンティティ ID
- 処理詳細

## セキュリティ考慮事項

### ログに出力してはいけない情報

以下の機密情報は絶対にログに出力しないでください：

- パスワード
- API キー・トークン
- クレジットカード情報
- 個人識別番号（マイナンバーなど）
- その他の個人情報（設計で定められた場合を除く）

### マスキング対象

以下の情報はマスキングして出力します：

- メールアドレス: `user@example.com` → `u***@e***.com`
- 電話番号: `090-1234-5678` → `090-****-5678`
- ユーザー名: `tanaka_taro` → `t***_t***`

## ログローテーション

### ファイル出力設定

- **ファイルサイズ**: 100MB
- **保存期間**: 30 日
- **圧縮**: gzip
- **ファイル名**: `app-YYYY-MM-DD-HH.log`

### 外部ログサービス連携

本番環境では以下のログサービスとの連携を推奨します：

- AWS CloudWatch Logs
- Google Cloud Logging
- Azure Monitor Logs
- Datadog
- Elasticsearch + Kibana

## 実装ガイドライン

### 1. ログライブラリ

推奨ライブラリ：

- **winston**: 構造化ログに適している
- **pino**: 高パフォーマンス

### 2. ミドルウェア実装

Hono のミドルウェアとして以下を実装：

```typescript
// 擬似コード
app.use(async (c, next) => {
  const start = Date.now();
  const requestId = generateRequestId();

  // リクエストログ
  logger.info({
    message: "Request started",
    requestId,
    method: c.req.method,
    path: c.req.path,
    userAgent: c.req.header("User-Agent"),
    ip: c.req.header("X-Forwarded-For") || "unknown",
  });

  await next();

  // レスポンスログ
  const responseTime = Date.now() - start;
  logger.info({
    message: "Request completed",
    requestId,
    statusCode: c.res.status,
    responseTime,
  });
});
```

### 3. エラーハンドリング

```typescript
// 擬似コード
app.onError((err, c) => {
  logger.error({
    message: "Unhandled error occurred",
    error: err.message,
    stack: process.env.NODE_ENV === "development" ? err.stack : undefined,
    requestId: c.get("requestId"),
    path: c.req.path,
    method: c.req.method,
  });

  return c.json({ error: "Internal Server Error" }, 500);
});
```

## 監視・アラート

### アラート条件

以下の条件でアラートを設定します：

1. **エラー率**: 5 分間でエラー率が 5%を超えた場合
2. **レスポンス時間**: 平均レスポンス時間が 1 秒を超えた場合
3. **データベース接続エラー**: データベース接続エラーが発生した場合
4. **認証エラー**: 1 分間に 10 回以上の認証エラーが発生した場合

### ダッシュボード

以下のメトリクスを可視化：

- リクエスト数（時系列）
- エラー率（時系列）
- レスポンス時間（時系列）
- エンドポイント別統計
- エラー種別統計

## 運用・保守

### ログ分析

定期的に以下の分析を実施：

1. **パフォーマンス分析**: レスポンス時間の傾向
2. **エラー分析**: エラーの発生頻度と原因
3. **セキュリティ分析**: 不正アクセスの検知
4. **利用状況分析**: API 利用状況の把握

### ログ保存期間

| 環境         | 保存期間 | 理由               |
| ------------ | -------- | ------------------ |
| 開発         | 7 日     | 開発時のデバッグ用 |
| ステージング | 30 日    | テスト・検証用     |
| 本番         | 1 年     | 監査・障害調査用   |

## 関連ドキュメント

- [CODING_RULES.md](./CODING_RULES.md) - コーディング規約
- [API 仕様書](../src/presentation/openapi/index.ts) - API 仕様
- 運用手順書（作成予定）

---

**更新履歴**

| 日付       | 版数 | 更新内容 | 更新者 |
| ---------- | ---- | -------- | ------ |
| 2025-06-30 | 1.0  | 初版作成 | -      |
