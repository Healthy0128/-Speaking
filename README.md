# スピーキングトライ / Piper版

Unit 4の10文を収録。Unit 5の例文は未登録。GitHub Pages向けVite構成です。

## 公開
1. このフォルダの**中身**を `Healthy0128/-Speaking` のルートに配置。
2. GitHub の Settings → Pages → Build and deployment → Source を **GitHub Actions** に設定。
3. `main`へのpushでPagesへ公開（この作業用ZIP自体はpushしていません）。

## ローカル開発
`npm install` → `npm run dev`。ビルドは`npm run build`。

## 読み上げ
Piper Web + `en_US-hfc_female-medium`。初回に外部から音声モデルが取得され、ブラウザのOPFSへキャッシュされます。管理Edgeの通信制限によりモデル取得に失敗する可能性があります。GitHub Pagesへの配置だけでは、モデル配信元へのアクセスが保証されません。

音声は英文から生成し、通常速度は1.0、ゆっくりは0.7で再生します。ハイライトは音声時間に応じた概算で、単語境界への厳密な同期ではありません。

注意：生徒の音声認識には引き続きブラウザのWeb Speech Recognition APIを使用します。

ソフトウェアのMITライセンスとは別に、音声モデル固有の利用条件の確認が必要です。