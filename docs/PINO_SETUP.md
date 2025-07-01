# Pino Logger 設定ガイド

## 概要

このプロジェクトでは、高パフォーマンスなログライブラリ[Pino](https://github.com/pinojs/pino)を使用しています。

## 必要なパッケージ

```bash
pnpm add pino
pnpm add -D pino-pretty  # 開発環境用
```

## ファイル構成

```
src/
├── lib/
│   └── logger.ts           # Pinoの設定とヘルパー関数
├── presentation/
│   └── middleware/
│       └── logger.ts       # Honoミドルウェア
└── app.ts                  # ミドルウェアの適用
```

## 設定ファイル

### 環境変数

`.env`ファイルまたは環境変数で以下を設定してください：

```bash
NODE_ENV=development        # production, development, test
LOG_LEVEL=debug            # error, warn, info, debug
SERVICE_NAME=hono-template-api
SERVICE_VERSION=1.0.0
```

### logger.ts

- **本番環境**: 構造化ログ（JSON 形式）
- **開発環境**: 人間が読みやすい形式（pino-pretty 使用）
- **テスト環境**: ログ出力を無効化

## 使用方法

### 1. 基本的なログ出力

```typescript
import { logger } from "./lib/logger.js";

// 基本的なログ
logger.info("Application started");
logger.error("Something went wrong");
logger.debug("Debug information");
```

### 2. ミドルウェアの使用

```typescript
import {
  loggerMiddleware,
  errorLoggerMiddleware,
} from "./presentation/middleware/logger.js";

const app = new Hono();

// ログミドルウェアを適用
app.use("*", loggerMiddleware());
app.use("*", errorLoggerMiddleware());
```

### 3. ヘルパー関数の使用

```typescript
import {
  logBusinessOperation,
  logDatabaseOperation,
  logSecurityEvent,
} from "./presentation/middleware/logger.js";

// ビジネスロジックログ
logBusinessOperation(c, "user_creation", "success", userId, {
  email: "user@example.com",
});

// データベース操作ログ
logDatabaseOperation(c, "INSERT", "users", 150, 1);

// セキュリティイベントログ
logSecurityEvent(c, "Failed login attempt", "medium", { attempts: 3 });
```

## ログレベル

| レベル  | 説明         | 使用例                         |
| ------- | ------------ | ------------------------------ |
| `error` | エラー情報   | システム異常、例外処理         |
| `warn`  | 警告情報     | 非推奨機能の使用、リソース不足 |
| `info`  | 一般的な情報 | API 呼び出し、重要な処理       |
| `debug` | デバッグ情報 | 詳細な処理状況、変数の値       |

## ログ形式

### 開発環境（Human Readable）

```
[2025-06-30 12:34:56.789] INFO [req-123abc456def] POST /api/users (201) 150ms - User created successfully
```

### 本番環境（JSON）

```json
{
  "timestamp": "2025-06-30T12:34:56.789Z",
  "level": "INFO",
  "message": "User created successfully",
  "service": "hono-template-api",
  "version": "1.0.0",
  "requestId": "req-123abc456def",
  "method": "POST",
  "path": "/api/users",
  "statusCode": 201,
  "responseTime": 150
}
```

## セキュリティ

以下の情報は自動的にマスキングされます：

- `password`
- `token`
- `apiKey`
- `secret`
- `authorization`
- `cookie`

## 本番環境での外部サービス連携

構造化ログ（JSON 形式）により、以下のサービスと簡単に連携できます：

- AWS CloudWatch Logs
- Google Cloud Logging
- Azure Monitor Logs
- Datadog
- Elasticsearch + Kibana

## トラブルシューティング

### 1. ログが出力されない

環境変数`LOG_LEVEL`を確認してください：

```bash
export LOG_LEVEL=debug
```

### 2. 開発環境で JSON 形式で出力される

`NODE_ENV`が正しく設定されているか確認してください：

```bash
export NODE_ENV=development
```

### 3. pino-pretty が動作しない

開発依存関係として正しくインストールされているか確認してください：

```bash
pnpm add -D pino-pretty
```

## サンプルコード

詳細な使用例は `src/presentation/routes/sampleRoute.ts` を参照してください。
