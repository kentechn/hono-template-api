import type { LoggerOptions } from "pino";
import * as pino from "pino";

// 環境変数の取得
const NODE_ENV = process.env.NODE_ENV || "development";
const LOG_LEVEL =
  process.env.LOG_LEVEL || (NODE_ENV === "production" ? "info" : "debug");
const SERVICE_NAME = process.env.SERVICE_NAME || "hono-template-api";
const SERVICE_VERSION = process.env.SERVICE_VERSION || "1.0.0";

// 本番環境用の設定
const productionConfig: LoggerOptions = {
  level: LOG_LEVEL,
  base: {
    service: SERVICE_NAME,
    version: SERVICE_VERSION,
  },
  timestamp: pino.stdTimeFunctions.isoTime,
  formatters: {
    level: (label) => ({ level: label.toUpperCase() }),
  },
  redact: {
    paths: [
      // 機密情報をマスキング
      "*.password",
      "*.token",
      "*.apiKey",
      "*.secret",
      "*.authorization",
      "*.cookie",
      "req.headers.authorization",
      "req.headers.cookie",
      "res.headers['set-cookie']",
    ],
    censor: "***REDACTED***",
  },
  serializers: {
    req: (req) => ({
      method: req.method,
      url: req.url,
      headers: {
        host: req.headers?.host,
        "user-agent": req.headers?.["user-agent"],
        "content-type": req.headers?.["content-type"],
        "content-length": req.headers?.["content-length"],
        "x-forwarded-for": req.headers?.["x-forwarded-for"],
        "x-real-ip": req.headers?.["x-real-ip"],
      },
      remoteAddress: req.socket?.remoteAddress,
      remotePort: req.socket?.remotePort,
    }),
    res: (res) => ({
      statusCode: res.statusCode,
      headers: {
        "content-type": res.getHeader?.("content-type"),
        "content-length": res.getHeader?.("content-length"),
      },
    }),
    err: pino.stdSerializers.err,
  },
};

// 開発環境用の設定
const developmentConfig: LoggerOptions = {
  level: LOG_LEVEL,
  transport: {
    target: "pino-pretty",
    options: {
      colorize: true,
      translateTime: "yyyy-mm-dd HH:MM:ss.l",
      ignore: "pid,hostname",
      messageFormat: "[{requestId}] {msg}",
      errorProps: "stack",
    },
  },
  base: {
    service: SERVICE_NAME,
    version: SERVICE_VERSION,
  },
  redact: {
    paths: [
      // 機密情報をマスキング
      "*.password",
      "*.token",
      "*.apiKey",
      "*.secret",
      "*.authorization",
      "*.cookie",
      "req.headers.authorization",
      "req.headers.cookie",
      "res.headers['set-cookie']",
    ],
    censor: "***REDACTED***",
  },
};

// テスト環境用の設定
const testConfig: LoggerOptions = {
  level: "silent", // テスト時はログを出力しない
};

// 環境に応じた設定を選択
function getLoggerConfig(): LoggerOptions {
  switch (NODE_ENV) {
    case "production":
      return productionConfig;
    case "test":
      return testConfig;
    default:
      return developmentConfig;
  }
}

// ロガーインスタンスの作成
export const logger = pino.pino(getLoggerConfig());

// リクエストID生成用のユーティリティ
export function generateRequestId(): string {
  return `req-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

// 構造化ログ用のヘルパー関数
export const logHelpers = {
  // HTTPリクエスト開始ログ
  requestStart: (data: {
    requestId: string;
    method: string;
    path: string;
    userAgent?: string;
    ip?: string;
    userId?: string;
  }) => {
    logger.info({
      message: "Request started",
      ...data,
    });
  },

  // HTTPリクエスト完了ログ
  requestEnd: (data: {
    requestId: string;
    method: string;
    path: string;
    statusCode: number;
    responseTime: number;
    userId?: string;
  }) => {
    const level =
      data.statusCode >= 500
        ? "error"
        : data.statusCode >= 400
          ? "warn"
          : "info";
    logger[level]({
      message: "Request completed",
      ...data,
    });
  },

  // エラーログ
  error: (data: {
    message: string;
    error: Error;
    requestId?: string;
    userId?: string;
    context?: Record<string, unknown>;
  }) => {
    logger.error({
      message: data.message,
      err: data.error,
      stack: NODE_ENV === "development" ? data.error.stack : undefined,
      requestId: data.requestId,
      userId: data.userId,
      ...data.context,
    });
  },

  // データベース操作ログ
  database: (data: {
    operation: "SELECT" | "INSERT" | "UPDATE" | "DELETE";
    table: string;
    executionTime: number;
    requestId?: string;
    affectedRows?: number;
  }) => {
    logger.info({
      message: "Database operation",
      ...data,
    });
  },

  // ビジネスロジックログ
  business: (data: {
    operation: string;
    result: "success" | "failure";
    requestId?: string;
    userId?: string;
    entityId?: string;
    details?: Record<string, unknown>;
  }) => {
    const level = data.result === "failure" ? "warn" : "info";
    logger[level]({
      message: `Business operation: ${data.operation}`,
      ...data,
    });
  },

  // セキュリティイベントログ
  security: (data: {
    event: string;
    severity: "low" | "medium" | "high" | "critical";
    requestId?: string;
    userId?: string;
    ip?: string;
    details?: Record<string, unknown>;
  }) => {
    const level =
      data.severity === "critical" || data.severity === "high"
        ? "error"
        : "warn";
    logger[level]({
      message: `Security event: ${data.event}`,
      ...data,
    });
  },
};

export default logger;
