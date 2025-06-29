# Hono Template App Just Commands
# See https://github.com/casey/just for more information

# Development commands
# Start development environment (DB + Prisma generate + app server)
# 利用可能コマンド一覧
help:
    @echo "📋 Available commands:"
    @just --list

start_app_dev:
    @echo "🚀 Starting development environment..."
    @echo "📦 Starting database..."
    docker compose up -d
    @echo "🔧 Generating Prisma client..."
    pnpm run prisma:generate
    @echo "🎯 Starting Prisma Studio..."
    pnpm run prisma:studio &
    @echo "🎯 Starting development server..."
    pnpm run dev

# 新規開発者向け初期セットアップ
setup_new_dev:
    @echo "🔧 Setting up project for new developer..."
    pnpm install
    docker compose up -d
    sleep 3
    pnpm run prisma:generate
    pnpm run prisma:migrate
    @echo "✅ Setup complete! Run 'just start_app_dev' to start development."

# コード品質チェック（format + lint + type check）
quality_check:
    @echo "🔍 Running full code quality check..."
    pnpm biome check --write .
    pnpm tsc --noEmit
    @echo "✅ Code quality check complete!"

# データベース完全リセット
reset_db:
    @echo "🔄 Resetting database completely..."
    docker compose down -v
    docker compose up -d
    sleep 3
    pnpm run prisma:migrate
    @echo "✅ Database reset complete!"

# 本番準備（品質チェック + ビルド + テスト）
prepare_production:
    @echo "🚀 Preparing for production..."
    pnpm biome check --write .
    pnpm tsc --noEmit
    pnpm test
    pnpm build
    @echo "✅ Production ready!"

# 完全クリーンアップ
cleanup:
    @echo "🧹 Cleaning up everything..."
    docker compose down -v
    rm -rf dist/
    rm -rf node_modules/.cache/
    rm -rf coverage/
    @echo "✅ Cleanup complete!"
