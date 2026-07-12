# Audit Teknis MMOS — Juli 2026 (Lanjutan)

**Repo:** github.com/adminberitakarya-Aji/mmos
**Commit diaudit:** `952ca0f` (18 commit total, HEAD di `master`)
**Metode:** clone bersih → `npm install` → build → `vitest run` → `tsc --noEmit` per package → `eslint` → review kode manual pada bug yang gagal test/build.

Audit sebelumnya (`AUDIT_REPORT.md` di root) menilai fase *specification-only* (belum ada kode). Sekarang repo sudah punya implementasi nyata: `@mmos/sdk`, `@mmos/runtime` (5-loop architecture), dan 3 aplikasi contoh. Audit ini fokus pada **kesiapan produksi kode**, bukan lagi kualitas spesifikasi.

---

## Ringkasan Eksekutif

| Area | Status |
|---|---|
| `@mmos/sdk` — build, typecheck, test | ✅ **Bersih** (73/73 test lulus) |
| `@mmos/runtime` — typecheck | ✅ Bersih (setelah urutan build diperbaiki) |
| `@mmos/runtime` — test | ❌ **4 dari 96 test gagal** — bug nyata di scheduler |
| `packages/examples` (3 app contoh) | ❌ Typecheck gagal total — beberapa bug berbeda |
| Root scripts (`typecheck`, `test`, `lint --workspaces`) | ❌ Rusak — tidak bisa dipakai sebagai gerbang kualitas saat ini |
| CI/CD | ❌ Masih tidak ada (`.github/` tidak ditemukan) — gap kritis dari audit lama belum ditutup |

**Kesimpulan:** Fondasi SDK solid dan siap produksi. Runtime punya satu bug logika penting di scheduler yang **bisa menyebabkan task yang sudah selesai dieksekusi ulang**. Ketiga contoh aplikasi punya bug tipe/import yang mencegahnya di-build sama sekali. Tidak ada satupun ini blocker besar untuk diperbaiki, tapi semuanya harus selesai sebelum rilis produksi.

---

## 1. Bug Kritis — `findReadyTasks` tidak mengecualikan task yang sudah selesai

**File:** `packages/runtime/src/loops/scheduler/dependency-evaluator.ts`

```ts
export function findReadyTasks(tasks, workflow, completed) {
  const resolver = createDependencyResolver(workflow);
  const ready: Uoid[] = [];
  for (const task of tasks) {
    const deps = resolver(task.uoid);
    const result = evaluateDependencies(task, deps, { completed });
    if (result.satisfied) ready.push(task.uoid);   // ⚠️ tidak cek apakah task INI sendiri sudah completed
  }
  return ready;
}
```

Fungsi ini hanya mengecek apakah **dependensi** task sudah selesai, tapi tidak mengecek apakah **task itu sendiri** sudah ada di map `completed`. Akibatnya task yang sudah selesai (dan tidak punya dependensi sendiri) akan terus muncul sebagai "ready" selamanya.

**Reproduksi (test yang gagal):**
```
t1 (tanpa dependency, sudah completed) + t2 (depends on t1)
→ diharapkan ready = [t2]
→ nyatanya ready = [t1, t2]   ❌
```

**Dampak produksi:** Ini komponen inti SchedulerLoop. Jika lolos ke produksi, task yang sudah selesai berpotensi di-*dispatch* ulang ke Engine — pemborosan biaya (terutama jika Engine memanggil provider AI berbayar), efek samping ganda, dan berpotensi infinite loop pada workflow siklik yang tidak lengkap dependency graph-nya.

**Rekomendasi fix:** tambahkan guard `if (completed.has(task.uoid)) continue;` di awal loop.

---

## 2. Bug — `FairSelector.pickNext` round-robin tidak deterministik

**File:** `packages/runtime/src/loops/scheduler/fair-selection.ts`

Round-robin diurutkan murni berdasarkan `Date.now()` (resolusi 1ms), tanpa tie-breaker (`ReadyQueue` punya `seq` counter untuk kasus ini, `FairSelector` tidak). Ketika dua Execution dipanggil `pickNext()` berturut-turut dalam milidetik yang sama (sangat umum di eksekusi sinkron/cepat), keduanya punya `lastServedAt` yang identik, sort jadi stabil ke urutan asal, dan **Execution yang sama menang terus** — round-robin gagal, berpotensi starvation nyata di produksi saat scheduler jalan cepat (mis. banyak task ringan back-to-back).

**Reproduksi:** test `FairSelector > rotates round-robin` dan `Scheduler end-to-end > round-robins between multiple ready executions` sama-sama gagal karena akar masalah ini.

**Rekomendasi fix:** tambahkan sequence counter monotonik (mirip `seq` di `ready-queue.ts`) sebagai tie-breaker kedua dalam `pickNext`, bukan hanya mengandalkan timestamp wall-clock.

---

## 3. Bug — File duplikat nyasar merusak typecheck `news-production`

**File nyasar:** `packages/examples/news-production/src/capabilities headline-generate-capability.ts`
(perhatikan: ini **satu file** dengan spasi di namanya, bukan folder `capabilities/` + file — kemungkinan besar salah ketik `/` jadi spasi saat membuat file, sehingga duplikat dari file asli yang sudah benar di `src/capabilities/headline-generate-capability.ts`)

File nyasar ini meng-`import '../types.js'` yang valid *jika* lokasinya di `src/capabilities/`, tapi karena dia sebenarnya duduk di `src/`, importnya salah arah → `Cannot find module '../types.js'`.

**Rekomendasi fix:** hapus file nyasar tersebut, sisakan hanya `src/capabilities/headline-generate-capability.ts` yang benar.

---

## 4. Bug — `packages/examples/tsconfig.json` salah level `extends`

```json
// packages/examples/tsconfig.json (SALAH)
"extends": "../../../tsconfig.base.json"   // naik 3 level dari packages/examples/ → keluar dari repo!

// Seharusnya (2 level: examples → packages → root):
"extends": "../../tsconfig.base.json"
```

Ini membuat `npm run typecheck --workspaces` dan `npm test --workspaces` di root **gagal total sejak langkah pertama**, karena `@mmos/examples` adalah salah satu workspace. Sub-folder contoh (`blog-generation/`, `news-production/`, `social-media/`) sudah benar pakai `../../../` karena mereka memang 3 level dari root.

**Dampak:** Siapapun yang menjalankan `npm run typecheck` atau `npm test` di root repo langsung mendapat error dan tidak bisa melihat status package lain — ini kemungkinan alasan kenapa bug scheduler di atas belum ketahuan sebelumnya (sinyal CI tertutup oleh error yang tidak relevan).

---

## 5. Bug sistemik — `exactOptionalPropertyTypes` dilanggar di 3 runner script

`tsconfig.base.json` mengaktifkan `exactOptionalPropertyTypes` dan `noUncheckedIndexedAccess` (praktik ketat, bagus). Tapi pola parsing argumen CLI di ketiga contoh melanggarnya dengan cara yang sama persis:

```ts
// blog-generation/src/run-blog-example.ts, news-production/src/run-news-example.ts,
// social-media/src/run-social-example.ts — pola yang sama di ketiganya
if (arg === '--topic' && i + 1 < args.length) {
  input.topic = args[++i];   // args[++i] bertipe string | undefined, input.topic butuh string
}
```

Walau secara runtime aman (sudah dicek `i + 1 < args.length`), TypeScript tidak bisa membuktikan itu, sehingga `tsc --noEmit` gagal di ketiga file. Ditambah beberapa masalah spesifik:
- `news-production/src/capabilities/news-verify-capability.ts` & `news-generator.ts`: field opsional (`source`, `thumbnailFile`) di-assign `string | undefined` ke tipe yang mewajibkan `string`.
- `social-media/src/capabilities/text-generate-capability.ts:56`: mengakses `campaign.audience` — tapi `CampaignBrief` **tidak punya** field `audience` (field itu ada di `SocialMetadata`, bukan `CampaignBrief`). Ini bukan cuma masalah tipe, tapi **bug logika**: kemungkinan besar kode ini seharusnya memakai parameter `audience: AudienceProfile` yang sudah di-destructure terpisah, bukan `campaign.audience`. Kalau dibiarkan, caption yang dihasilkan akan selalu fallback ke default `"UMKM Indonesia"` alih-alih memakai target audiens sebenarnya dari campaign brief.
- `social-media/src/run-social-example.ts:31`: `Object is possibly 'undefined'`.

**Rekomendasi fix:** ganti pola `args[++i]` dengan helper kecil yang melempar error jelas jika argumen hilang, alih-alih assignment langsung. Untuk bug `campaign.audience`, perbaiki agar memakai parameter `audience` yang benar.

---

## 6. Temuan minor — test `ready-queue` tidak benar-benar menguji jalurnya sendiri

**File:** `packages/runtime/src/loops/scheduler/scheduler-loop.test.ts` (test `'orders by priority then seq'`)

```ts
const e = {} as Execution;   // Execution kosong, tanpa .uoid
q.enqueue(t1, e, 'low');     // → ready-queue.ts throw: Cannot read properties of undefined (reading 'toString')
```

`ready-queue.ts` men-dereference `execution.uoid.toString()` untuk dedup key, tapi test-nya memakai stub `{}` tanpa `uoid`. Test lain di file yang sama sudah benar pakai helper `makeExecution(id)`. Ini kemungkinan salah ketik saat menulis test, bukan bug di kode produksi — tapi efeknya jalur "order by priority" di `ReadyQueue` **tidak pernah benar-benar tervalidasi test**. Perbaiki test-nya memakai `makeExecution('e1')` seperti test lain.

---

## 7. Tooling — `lint` rusak, tidak ada CI/CD

- `npm run lint` di `sdk` maupun `runtime` gagal dengan `eslint: not found` — eslint tidak pernah ditambahkan ke `devDependencies`, dan tidak ada file konfigurasi `.eslintrc*`/`eslint.config.*` di manapun di repo. Script `lint` di `package.json` murni tidak fungsional sejak awal.
- Tidak ada folder `.github/workflows` — rekomendasi CI/CD dari audit sebelumnya (Juli 2026, item prioritas 🔴 TINGGI) **belum ditindaklanjuti**. Tanpa CI, empat bug di atas bisa masuk ke `master` tanpa terdeteksi karena tidak ada gerbang otomatis yang menjalankan build+test+typecheck pada tiap push/PR.

---

## Status yang Sudah Bagus (tidak perlu diubah)

- **Path resolution schema SDK** (bug yang kita fix sesi lalu) sudah **terverifikasi solid**: `tsup.config.ts` meng-copy `specs/schemas/*.schema.json` ke `dist/schemas/` saat build, dan `schema/index.ts` punya fallback path untuk mode dev vs built package. Build ulang dari nol mengonfirmasi ini bekerja sebagaimana mestinya.
- `@mmos/sdk`: 73/73 test lulus, typecheck bersih, build ESM+CJS+DTS sukses.
- `@mmos/runtime`: typecheck 100% bersih (92/96 test lulus — 4 gagal semuanya terkait bug #1 dan #2 di atas, bukan masalah lain).
- Disiplin arsitektur (ADR compliance, pemisahan Loop, provider-agnostic) tetap konsisten terjaga di level implementasi, bukan cuma di dokumen.

---

## Prioritas Perbaikan untuk Menuju Produksi

| # | Item | Prioritas |
|---|------|-----------|
| 1 | Fix `findReadyTasks` — exclude task yang sudah `completed` | 🔴 Blocker |
| 2 | Fix `packages/examples/tsconfig.json` (`../../../` → `../../`) | 🔴 Blocker (menutup sinyal CI) |
| 3 | Hapus file nyasar `src/capabilities headline-generate-capability.ts` | 🔴 Blocker |
| 4 | Fix tie-breaker `FairSelector.pickNext` | 🟠 Tinggi |
| 5 | Fix bug logika `campaign.audience` di social-media | 🟠 Tinggi |
| 6 | Fix pola `args[++i]` di 3 runner script + optional-field lain | 🟡 Sedang |
| 7 | Perbaiki test `ready-queue` yang salah stub | 🟡 Sedang |
| 8 | Tambahkan eslint + config nyata, atau hapus script `lint` yang palsu | 🟡 Sedang |
| 9 | Tambahkan GitHub Actions CI (lint+typecheck+test+build tiap PR) | 🔴 Tinggi (gap lama, belum ditutup) |

---

*Item #1–7 sudah saya identifikasi lokasi persis dan root cause-nya — siap saya perbaiki langsung kalau Mas Aji mau lanjut sekarang.*
