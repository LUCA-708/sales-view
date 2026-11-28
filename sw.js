/*
  📱 売上 — 電波が無いときのための「控え」係（出勤簿の sw.js と同じ型）

  🔴 index.html を直したら CACHE の版番号を1つ上げること（上げ忘れは send.py が止める）。
  🔴 古い控えを消すのは自分の名前（PREFIX）で始まるものだけ（計算機・出勤簿・タスクと同じ住所＝置き場を共有）。
  🔴 data.bin（暗号の数字）は控えない＝毎回取りに行く。控えると古い数字を出し続ける。
     最後に読めた数字はページが自分で預かる（IndexedDB）＝電波が無くても前回分は見える。
*/

var PREFIX = "salesview-";
var CACHE = PREFIX + "v3";

var FILES = ["./", "./index.html", "./manifest.webmanifest", "./icon-180.png"];

self.addEventListener("install", function (e) {
  e.waitUntil(
    caches.open(CACHE).then(function (c) {
      // cache:"reload"＝GitHub Pages の10分の一時置き場を通さず必ず取り直す
      return c.addAll(FILES.map(function (f) { return new Request(f, { cache: "reload" }); }));
    }).then(function () { return self.skipWaiting(); })
  );
});

self.addEventListener("activate", function (e) {
  e.waitUntil(
    caches.keys().then(function (names) {
      return Promise.all(names.map(function (n) {
        return n.indexOf(PREFIX) === 0 && n !== CACHE ? caches.delete(n) : null;
      }));
    }).then(function () { return self.clients.claim(); })
  );
});

self.addEventListener("fetch", function (e) {
  var req = e.request, url = new URL(req.url);
  if (req.method !== "GET" || url.origin !== self.location.origin) return;
  if (/\/data\.bin$/.test(url.pathname)) return;          // 数字は控えから出さない（ネットへそのまま）
  e.respondWith(
    caches.match(req, { ignoreSearch: true }).then(function (hit) {
      return hit || fetch(req);
    })
  );
});
