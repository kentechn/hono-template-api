# Coding Rules

このプロジェクトのコーディング規約について説明します。

## 概要

このプロジェクトでは、コードの一貫性と品質を保つために[Biome](https://biomejs.dev/)を使用しています。

**重要**: 具体的な設定値（インデント幅、行の最大文字数、クォートスタイルなど）については、常にプロジェクトルートの `biome.json` ファイルを参照してください。設定が変更された場合は、そちらが最新の情報となります。

## フォーマッティング

### 基本設定

詳細な設定については、プロジェクトルートの `biome.json` ファイルを参照してください。

主な設定：

- **設定ファイル**: `biome.json`
- **フォーマッター**: 有効
- **自動インポート整理**: 有効

### 具体例

#### 良い例

```typescript
const message = "Hello, World!";

function greetUser(name: string): string {
  return `Hello, ${name}!`;
}

const user = {
  name: "Taro",
  age: 25,
  email: "taro@example.com",
};
```

#### 悪い例

```typescript
const message = "Hello, World!"; // シングルクォートは使用しない

function greetUser(name: string): string {
  return `Hello, ${name}!`; // 4文字インデントは使用しない
}

const user = { name: "Taro", age: 25, email: "taro@example.com" }; // 改行なし、シングルクォートは使用しない
```

## リンティング

### 設定

詳細なリンティング設定については、`biome.json` の `linter` セクションを参照してください。

- **リンター**: 有効
- **ルールセット**: 推奨ルール

### 主なルール例

- 未使用の変数や関数は削除する
- console.log は本番環境に残さない
- 適切な型注釈を付ける
- ESLint の推奨ルールに従う

## インポート

### 自動整理

詳細な設定については、`biome.json` の `assist.actions.source` セクションを参照してください。

- インポートの自動整理が有効化されています
- 保存時に自動的にインポートが整理されます

### インポート順序

1. Node.js の標準モジュール
2. 外部ライブラリ
3. 内部モジュール（相対パス）

#### 例

```typescript
import { readFile } from "fs/promises"; // Node.js標準
import express from "express"; // 外部ライブラリ
import { Hono } from "hono"; // 外部ライブラリ

import { UserService } from "./services/userService"; // 内部モジュール
import { validateInput } from "../utils/validation"; // 内部モジュール
```

## ファイル構成

### ディレクトリ構造

プロジェクトのディレクトリ構造については、プロジェクトルートの `README.md` ファイルの「フォルダ構成」セクションを参照してください。

構造が変更された場合は、README.md が最新の情報となります。

### ファイル命名規則

- ファイル名: camelCase （例: `userService.ts`）
- クラス名: PascalCase （例: `UserService`）
- 関数名: camelCase （例: `getUserById`）
- 定数: UPPER_SNAKE_CASE （例: `MAX_RETRY_COUNT`）

## TypeScript

### 型定義

- 明示的な型注釈を推奨します
- `any`型の使用は避けてください
- 必要に応じてジェネリクスを使用してください

#### 例

```typescript
// 良い例
interface User {
  id: number;
  name: string;
  email: string;
}

function createUser(userData: Omit<User, "id">): User {
  return {
    id: Math.random(),
    ...userData,
  };
}

// 悪い例
function createUser(userData: any): any {
  // any型は避ける
  return {
    id: Math.random(),
    ...userData,
  };
}
```

## エラーハンドリング

### 基本方針

- 適切なエラーハンドリングを行う
- カスタムエラークラスを使用する
- ログ出力を適切に行う

## コメント

### JSDoc

- 公開関数には適切な JSDoc コメントを記述する

```typescript
/**
 * ユーザー情報を取得する
 * @param userId - ユーザーID
 * @returns ユーザー情報
 * @throws {UserNotFoundError} ユーザーが見つからない場合
 */
async function getUserById(userId: number): Promise<User> {
  // 実装
}
```

## 開発ツール

### Biome コマンド

```bash
# フォーマットチェック
pnpm biome format .

# フォーマット実行
pnpm biome format --write .

# リントチェック
pnpm biome lint .

# リント修正
pnpm biome lint --write .

# 全体チェック
pnpm biome check .

# 全体修正
pnpm biome check --write .
```

## エディタ設定

### VS Code

以下の設定を推奨します：

```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "biomejs.biome",
  "editor.codeActionsOnSave": {
    "source.organizeImports": "explicit"
  }
}
```

## 最後に

- コミット前には必ず Biome でのチェックを実行してください
- CI/CD パイプラインでも Biome チェックが実行されます
- 設定に関する疑問や提案がある場合は、チームで議論してください

このルールに従うことで、プロジェクト全体のコード品質と保守性を向上させることができます。
