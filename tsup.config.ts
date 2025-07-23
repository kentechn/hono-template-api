import { defineConfig } from 'tsup'

export default defineConfig({
  entry: ['src/index.ts'],      // エントリーポイント（ビルド開始点）
  format: ['esm'],              // 出力形式（ESモジュール）
  dts: false,                    // 型定義ファイル(.d.ts)を生成
  splitting: false,             // コード分割しない（単一ファイル出力）
  sourcemap: false,             // ソースマップを生成しない
  clean: true,                  // ビルド前にdistディレクトリをクリア
  outDir: 'dist',               // 出力ディレクトリ
  target: 'node22',             // ターゲット環境（Node.js v22）
  minify: true,                // コードを圧縮（変数名短縮・空白削除など）
})
