# Hono Template Application(Todo App API)
## 概要
Honoを使ったTodoアプリAPIのテンプレートです。HonoはNode.jsのWebフレームワークで、軽量で高速なアプリケーション開発が可能です。
このアプリは、HonoにてAPIを構築するとき、baseとして利用できるようにしてます。

## 構成

### フォルダ構成
```
hono-template-app/
├── README.md               # プロジェクトのドキュメント
├── docs/                   # プロジェクトの詳細ドキュメント
├── node_modules/           # npmパッケージ
├── package.json            # プロジェクトの依存関係とスクリプト
├── pnpm-lock.yaml          # pnpmのロックファイル
├── src/                    # ソースコードのルートディレクトリ
│   ├── index.ts            # アプリケーションのエントリーポイント
│   ├── core/               # ビジネスロジックとドメイン層
│   │   ├── schemas/        # データ検証用のスキーマ定義
│   │   └── usecases/       # アプリケーションのユースケース
│   ├── infrastructure/     # 外部システムとの接続層
│   │   ├── database/       # データベース接続と設定
│   │   └── repositories/   # データアクセス層の実装
│   ├── lib/                # 共通ライブラリとヘルパー関数
│   ├── presentation/       # プレゼンテーション層（API）
│   │   ├── dto/            # データ転送オブジェクト
│   │   ├── middleware/     # Honoミドルウェア
│   │   └── routes/         # APIルート定義
│   └── util/               # ユーティリティ関数
└── tsconfig.json           # TypeScriptの設定ファイル
```
