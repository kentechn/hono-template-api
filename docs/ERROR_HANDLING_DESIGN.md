# エラーハンドリング設計書

## 目次

1. [概要](#概要)
2. [エラー分類体系](#エラー分類体系)
3. [エラーコード体系](#エラーコード体系)
4. [エラーレスポンス形式](#エラーレスポンス形式)
5. [HTTP ステータスコードとエラーコードの対応](#httpステータスコードとエラーコードの対応)
6. [ログ仕様](#ログ仕様)
7. [実装ガイドライン](#実装ガイドライン)
8. [運用フロー](#運用フロー)

## 概要

本設計書は、Hono Template API におけるエラーハンドリングの統一的な方針を定義します。
一貫性のあるエラーレスポンス、適切なログ出力、効率的なデバッグとトラブルシューティングを目的としています。

### 設計原則

- **一貫性**: すべての API エンドポイントで統一されたエラー形式
- **可読性**: 開発者とユーザーの両方にとって理解しやすいエラーメッセージ
- **トレーサビリティ**: エラーの原因を特定できる十分な情報
- **セキュリティ**: 機密情報の漏洩を防ぐ適切な情報レベル

## エラー分類体系

### 1. バリデーションエラー (Validation Errors)

- **概要**: リクエストデータの形式や値の検証エラー
- **HTTP ステータス**: 400 Bad Request
- **用途**: フォームバリデーション、データ型チェック、必須項目チェック
- **特徴**: 複数のエラーを配列で返却

### 2. ビジネスエラー (Business Errors)

- **概要**: ビジネスロジックに関連するエラー
- **HTTP ステータス**: 401, 403, 404, 409 など
- **用途**: 認証・認可、リソースの重複、業務ルール違反
- **特徴**: 単一のエラーオブジェクトで返却

### 3. システムエラー (System Errors)

- **概要**: システムレベルの予期しないエラー
- **HTTP ステータス**: 500 Internal Server Error
- **用途**: データベース接続エラー、外部 API 呼び出し失敗、予期しない例外
- **特徴**: 詳細なエラー情報はログに記録し、ユーザーには汎用的なメッセージを返却

## エラーコード体系

### バリデーションエラーコード

| エラーコード       | 説明                     | 使用場面                           |
| ------------------ | ------------------------ | ---------------------------------- |
| `VALIDATION_ERROR` | 汎用バリデーションエラー | フィールド固有のバリデーション失敗 |
| `REQUIRED_FIELD`   | 必須項目エラー           | 必須フィールドが未入力             |
| `INVALID_FORMAT`   | 形式エラー               | メールアドレス、日付形式など       |
| `INVALID_LENGTH`   | 長さエラー               | 文字数制限、配列長制限             |
| `INVALID_RANGE`    | 範囲エラー               | 数値の最小・最大値制限             |

### ビジネスエラーコード

#### 認証・認可関連

| エラーコード          | HTTP ステータス | 説明                             |
| --------------------- | --------------- | -------------------------------- |
| `UNAUTHORIZED`        | 401             | 認証トークンが無効または期限切れ |
| `INVALID_CREDENTIALS` | 401             | ログイン情報が正しくない         |
| `FORBIDDEN`           | 403             | リソースへのアクセス権限がない   |
| `TOKEN_EXPIRED`       | 403             | アクセストークンの有効期限切れ   |

#### リソース関連

| エラーコード         | HTTP ステータス | 説明                   |
| -------------------- | --------------- | ---------------------- |
| `USER_NOT_FOUND`     | 404             | ユーザーが見つからない |
| `TODO_NOT_FOUND`     | 404             | TODO が見つからない    |
| `RESOURCE_NOT_FOUND` | 404             | 汎用リソース未発見     |

#### データ整合性関連

| エラーコード           | HTTP ステータス | 説明                               |
| ---------------------- | --------------- | ---------------------------------- |
| `USER_ALREADY_EXISTS`  | 409             | ユーザーが既に存在する             |
| `EMAIL_ALREADY_EXISTS` | 409             | メールアドレスが既に使用されている |
| `DUPLICATE_RESOURCE`   | 409             | リソースの重複                     |

### システムエラーコード

| エラーコード          | HTTP ステータス | 説明                     |
| --------------------- | --------------- | ------------------------ |
| `INTERNAL_ERROR`      | 500             | 予期しないサーバーエラー |
| `DATABASE_ERROR`      | 500             | データベース関連エラー   |
| `EXTERNAL_API_ERROR`  | 500             | 外部 API 呼び出しエラー  |
| `SERVICE_UNAVAILABLE` | 503             | サービス一時停止         |

## エラーレスポンス形式

### バリデーションエラー形式

```json
{
  "errors": [
    {
      "code": "VALIDATION_ERROR",
      "message": "Email field is required",
      "field": "email"
    },
    {
      "code": "VALIDATION_ERROR",
      "message": "Password must be at least 8 characters",
      "field": "password"
    }
  ]
}
```

### ビジネス・システムエラー形式

```json
{
  "error": {
    "code": "USER_NOT_FOUND",
    "message": "No user found with the provided ID"
  }
}
```

### フィールド定義

- **code**: エラーの種類を識別する文字列コード
- **message**: 人間が読みやすいエラーメッセージ（英語）
- **field**: バリデーションエラーの場合、エラーが発生したフィールド名

## HTTP ステータスコードとエラーコードの対応

| HTTP ステータス | エラーカテゴリ       | 主要エラーコード                                       | 使用例                         |
| --------------- | -------------------- | ------------------------------------------------------ | ------------------------------ |
| 400             | バリデーションエラー | `VALIDATION_ERROR`                                     | フォーム入力エラー             |
| 401             | 認証エラー           | `UNAUTHORIZED`, `INVALID_CREDENTIALS`, `TOKEN_EXPIRED` | ログイン失敗、トークン無効     |
| 403             | 認可エラー           | `FORBIDDEN`                                            | 権限不足                       |
| 404             | リソース未発見       | `USER_NOT_FOUND`, `TODO_NOT_FOUND`                     | 存在しないリソースへのアクセス |
| 409             | 競合エラー           | `USER_ALREADY_EXISTS`, `EMAIL_ALREADY_EXISTS`          | データ重複                     |
| 500             | システムエラー       | `INTERNAL_ERROR`, `DATABASE_ERROR`                     | 予期しないエラー               |
| 503             | サービス停止         | `SERVICE_UNAVAILABLE`                                  | メンテナンス中                 |

## ログ仕様

### ログレベル定義

- **ERROR**: システムエラー、予期しないエラー（500 系）
- **WARN**: ビジネスエラー、認証・認可エラー（400, 401, 403, 404, 409）
- **INFO**: 正常なリクエスト処理、重要な操作
- **DEBUG**: 詳細なデバッグ情報

### ログ出力項目

```typescript
interface LogEntry {
  level: "ERROR" | "WARN" | "INFO" | "DEBUG";
  timestamp: string; // ISO 8601形式
  requestId: string; // リクエストの一意識別子
  method: string; // HTTPメソッド
  path: string; // リクエストパス
  statusCode: number; // HTTPステータスコード
  errorCode?: string; // エラーコード
  message: string; // ログメッセージ
  userId?: string; // 認証済みユーザーID
  duration: number; // 処理時間（ms）
  error?: {
    // エラー詳細（システムエラー時のみ）
    name: string;
    message: string;
    stack: string;
  };
  metadata?: Record<string, any>; // 追加メタデータ
}
```

### ログ出力例

#### バリデーションエラー

```json
{
  "level": "WARN",
  "timestamp": "2025-07-01T10:00:00.123Z",
  "requestId": "req-123456",
  "method": "POST",
  "path": "/auth/register",
  "statusCode": 400,
  "errorCode": "VALIDATION_ERROR",
  "message": "Validation failed for user registration",
  "duration": 45,
  "metadata": {
    "validationErrors": ["email", "password"]
  }
}
```

#### システムエラー

```json
{
  "level": "ERROR",
  "timestamp": "2025-07-01T10:00:00.123Z",
  "requestId": "req-789012",
  "method": "GET",
  "path": "/users/123",
  "statusCode": 500,
  "errorCode": "DATABASE_ERROR",
  "message": "Database connection failed",
  "userId": "user-456",
  "duration": 5000,
  "error": {
    "name": "ConnectionError",
    "message": "ECONNREFUSED: Connection refused",
    "stack": "ConnectionError: ECONNREFUSED..."
  }
}
```

## 実装ガイドライン

### 1. エラー処理の基本フロー

```typescript
// 1. エラーキャッチ
try {
  // ビジネスロジック実行
} catch (error) {
  // 2. エラー分類
  const errorType = classifyError(error);

  // 3. ログ出力
  logger.log(errorType.level, {
    requestId: c.get("requestId"),
    errorCode: errorType.code,
    message: errorType.message,
    error: errorType.level === "ERROR" ? error : undefined,
  });

  // 4. レスポンス生成
  return c.json(formatErrorResponse(errorType), errorType.statusCode);
}
```

### 2. カスタムエラークラスの実装

```typescript
export class BusinessError extends Error {
  constructor(
    public code: string,
    public message: string,
    public statusCode: number = 400,
    public field?: string
  ) {
    super(message);
    this.name = "BusinessError";
  }
}

export class ValidationError extends Error {
  constructor(
    public errors: Array<{
      code: string;
      message: string;
      field: string;
    }>
  ) {
    super("Validation failed");
    this.name = "ValidationError";
  }
}
```

### 3. ミドルウェアでの統一エラーハンドリング

```typescript
export const errorHandler = (): MiddlewareHandler => {
  return async (c, next) => {
    try {
      await next();
    } catch (error) {
      return handleError(c, error);
    }
  };
};
```

### 4. バリデーション実装例

```typescript
const registerSchema = z.object({
  email: z.string().email({ message: "Invalid email format" }),
  password: z
    .string()
    .min(8, { message: "Password must be at least 8 characters" }),
  name: z.string().min(1, { message: "Name is required" }),
});

// バリデーション実行
const result = registerSchema.safeParse(data);
if (!result.success) {
  const errors = result.error.errors.map((err) => ({
    code: "VALIDATION_ERROR",
    message: err.message,
    field: err.path.join("."),
  }));
  throw new ValidationError(errors);
}
```

## 運用フロー

### 1. エラー監視・アラート

- **レベル別アラート**: ERROR レベルのログは即座に通知
- **頻度監視**: 特定エラーの発生頻度が閾値を超えた場合にアラート
- **トレンド分析**: エラー発生傾向の定期的な分析

### 2. ログ分析

- **集約ダッシュボード**: エラー種別、発生頻度、傾向の可視化
- **リクエストトレース**: requestId による一連の処理追跡
- **パフォーマンス分析**: エラー時の処理時間分析

### 3. エスカレーション基準

1. **即座対応**: 500 エラーが連続で発生
2. **1 時間以内**: 認証エラーが大量発生
3. **当日対応**: 特定機能のエラー率が 10%超過
4. **翌営業日**: その他のエラー傾向分析

### 4. インシデント対応

1. **初期対応**: エラーアラート受信後 15 分以内
2. **原因調査**: ログ分析によるエラー原因特定
3. **一時対応**: 必要に応じて機能停止やフォールバック
4. **恒久対応**: 根本原因の修正とテスト
5. **事後検証**: 再発防止策の検討と実装

### 5. メトリクス定義

- **エラー率**: 総リクエスト数に対するエラー応答の割合
- **MTTR**: 平均復旧時間
- **可用性**: システム稼働時間の割合
- **エラー種別分布**: エラーコード別の発生割合

## 参考情報

### 関連ドキュメント

- [API 設計書](./api設計書/openapi.yml)
- [ログ設計書](./LOG_DESIGN.md)
- [Pino 設定ガイド](./PINO_SETUP.md)

### 更新履歴

- 2025-07-01: 初版作成
