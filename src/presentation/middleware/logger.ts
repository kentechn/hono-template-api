import type { Context, MiddlewareHandler, Next } from "hono";
import { generateRequestId, logHelpers } from "../../lib/logger.js";

// コンテキストにリクエストIDを追加するための型拡張
declare module "hono" {
  interface ContextVariableMap {
    requestId: string;
  }
}

// ログミドルウェア
export const loggerMiddleware = (): MiddlewareHandler => {
  return async (c: Context, next: Next) => {
    const start = Date.now();
    const requestId = generateRequestId();

    // リクエストIDをコンテキストに保存
    c.set("requestId", requestId);

    // リクエスト開始ログ
    logHelpers.requestStart({
      requestId,
      method: c.req.method,
      path: c.req.path,
      userAgent: c.req.header("User-Agent"),
      ip:
        c.req.header("X-Forwarded-For") ||
        c.req.header("X-Real-IP") ||
        "unknown",
      // 認証情報があれば追加（実装に応じて調整）
      // userId: c.get("userId"),
    });

    try {
      await next();
    } catch (error) {
      // エラーログ
      logHelpers.error({
        message: "Request processing failed",
        error: error as Error,
        requestId,
        // userId: c.get("userId"),
      });
      throw error;
    } finally {
      // レスポンス完了ログ
      const responseTime = Date.now() - start;
      logHelpers.requestEnd({
        requestId,
        method: c.req.method,
        path: c.req.path,
        statusCode: c.res.status,
        responseTime,
        // userId: c.get("userId"),
      });
    }
  };
};

// エラーハンドリングミドルウェア
export const errorLoggerMiddleware = (): MiddlewareHandler => {
  return async (c: Context, next: Next) => {
    try {
      await next();
    } catch (error) {
      const requestId = c.get("requestId") || "unknown";

      // 未ハンドルエラーのログ
      logHelpers.error({
        message: "Unhandled error occurred",
        error: error as Error,
        requestId,
        context: {
          path: c.req.path,
          method: c.req.method,
          userAgent: c.req.header("User-Agent"),
          ip: c.req.header("X-Forwarded-For") || c.req.header("X-Real-IP"),
        },
      });

      // エラーレスポンス
      return c.json(
        {
          error: "Internal Server Error",
          requestId,
        },
        500,
      );
    }
  };
};

// セキュリティイベント用ヘルパー
export const logSecurityEvent = (
  c: Context,
  event: string,
  severity: "low" | "medium" | "high" | "critical",
  details?: Record<string, unknown>,
) => {
  logHelpers.security({
    event,
    severity,
    requestId: c.get("requestId"),
    ip: c.req.header("X-Forwarded-For") || c.req.header("X-Real-IP"),
    // userId: c.get("userId"),
    details,
  });
};

// データベース操作ログ用ヘルパー
export const logDatabaseOperation = (
  c: Context,
  operation: "SELECT" | "INSERT" | "UPDATE" | "DELETE",
  table: string,
  executionTime: number,
  affectedRows?: number,
) => {
  logHelpers.database({
    operation,
    table,
    executionTime,
    requestId: c.get("requestId"),
    affectedRows,
  });
};

// ビジネスロジックログ用ヘルパー
export const logBusinessOperation = (
  c: Context,
  operation: string,
  result: "success" | "failure",
  entityId?: string,
  details?: Record<string, unknown>,
) => {
  logHelpers.business({
    operation,
    result,
    requestId: c.get("requestId"),
    // userId: c.get("userId"),
    entityId,
    details,
  });
};
