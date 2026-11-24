GAWEIN ANDROID PROJECT

Catatan: Ini proyek Android Studio yang membungkus prototype GAWEIN menggunakan Android WebView. APK belum dikompilasi di lingkungan ini karena Android SDK/Gradle tidak tersedia.

BUILD DENGAN ANDROID STUDIO:
1. Instal Android Studio dan Android SDK Platform 35.
2. Buka folder GAWEIN-Android.
3. Tunggu Gradle Sync selesai.
4. Pilih Build > Build Bundle(s) / APK(s) > Build APK(s).
5. APK ada di app/build/outputs/apk/debug/app-debug.apk.

BUILD OTOMATIS VIA GITHUB:
1. Upload seluruh isi folder ini ke repository GitHub branch main.
2. Buka tab Actions. Workflow "Build GAWEIN APK" berjalan otomatis setelah push, atau jalankan manual.
3. Unduh artifact "GAWEIN-debug-apk" dari hasil workflow.

Fitur prototype:
- Tampilan GAWEIN responsif.
- Mode pemberi dan pencari kerja.
- Pasang pekerjaan dan budget.
- Ajukan harga, tawaran balik, tolak/setujui.
- Riwayat negosiasi dan harga final.

Batasan:
Data disimpan lokal di perangkat. Login online, database bersama, chat real-time, notifikasi push, pembayaran, dan admin backend belum dibuat. Ini belum siap untuk transaksi produksi.
