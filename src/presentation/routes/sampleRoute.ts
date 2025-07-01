import type { Context } from "hono";
import { Hono } from "hono";
import {
  logBusinessOperation,
  logDatabaseOperation,
  logSecurityEvent,
} from "../middleware/logger.js";

const sampleRoute = new Hono();

// サンプル：ユーザー作成エンドポイント
sampleRoute.post("/users", async (c: Context) => {
  try {
    // リクエストボディの取得
    const body = await c.req.json();

    // バリデーション例
    if (!body.email || !body.name) {
      // セキュリティイベントログ（不正なリクエスト）
      logSecurityEvent(c, "Invalid user creation request", "low", {
        reason: "Missing required fields",
        providedFields: Object.keys(body),
      });

      return c.json({ error: "Email and name are required" }, 400);
    }

    // データベース操作のシミュレーション
    const dbStart = Date.now();

    // 実際のDB操作をここで実行
    // const user = await prisma.user.create({ data: body });
    const user = { id: "user-123", ...body };

    const dbExecutionTime = Date.now() - dbStart;

    // データベース操作ログ
    logDatabaseOperation(c, "INSERT", "users", dbExecutionTime, 1);

    // ビジネスロジックログ
    logBusinessOperation(c, "user_creation", "success", user.id, {
      email: body.email,
      name: body.name,
    });

    return c.json({ message: "User created successfully", user }, 201);
  } catch (error) {
    // ビジネスロジックログ（失敗）
    logBusinessOperation(c, "user_creation", "failure", undefined, {
      error: (error as Error).message,
    });

    throw error; // エラーミドルウェアで処理される
  }
});

// サンプル：ユーザー取得エンドポイント
sampleRoute.get("/users/:id", async (c: Context) => {
  const userId = c.req.param("id");

  try {
    // データベース操作のシミュレーション
    const dbStart = Date.now();

    // 実際のDB操作をここで実行
    // const user = await prisma.user.findUnique({ where: { id: userId } });
    const user =
      userId === "user-123"
        ? { id: userId, name: "Sample User", email: "sample@example.com" }
        : null;

    const dbExecutionTime = Date.now() - dbStart;

    // データベース操作ログ
    logDatabaseOperation(c, "SELECT", "users", dbExecutionTime);

    if (!user) {
      // ビジネスロジックログ（失敗）
      logBusinessOperation(c, "user_retrieval", "failure", userId, {
        reason: "User not found",
      });

      return c.json({ error: "User not found" }, 404);
    }

    // ビジネスロジックログ（成功）
    logBusinessOperation(c, "user_retrieval", "success", userId);

    return c.json({ user });
  } catch (error) {
    // ビジネスロジックログ（失敗）
    logBusinessOperation(c, "user_retrieval", "failure", userId, {
      error: (error as Error).message,
    });

    throw error;
  }
});

// サンプル：認証が必要なエンドポイント
sampleRoute.delete("/users/:id", async (c: Context) => {
  const userId = c.req.param("id");
  const authHeader = c.req.header("Authorization");

  // 認証チェック（サンプル）
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    // セキュリティイベントログ
    logSecurityEvent(c, "Unauthorized deletion attempt", "medium", {
      targetUserId: userId,
      reason: "Missing or invalid authorization header",
    });

    return c.json({ error: "Unauthorized" }, 401);
  }

  try {
    // データベース操作のシミュレーション
    const dbStart = Date.now();

    // 実際のDB操作をここで実行
    // await prisma.user.delete({ where: { id: userId } });

    const dbExecutionTime = Date.now() - dbStart;

    // データベース操作ログ
    logDatabaseOperation(c, "DELETE", "users", dbExecutionTime, 1);

    // ビジネスロジックログ
    logBusinessOperation(c, "user_deletion", "success", userId);

    // セキュリティイベントログ（重要な操作）
    logSecurityEvent(c, "User deletion", "low", {
      deletedUserId: userId,
    });

    return c.json({ message: "User deleted successfully" });
  } catch (error) {
    // ビジネスロジックログ（失敗）
    logBusinessOperation(c, "user_deletion", "failure", userId, {
      error: (error as Error).message,
    });

    throw error;
  }
});

export default sampleRoute;
