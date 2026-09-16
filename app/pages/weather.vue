<template>
  <main class="min-h-screen bg-gray-50">
    <div class="container-custom mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8 md:py-16">
      <!-- Tiêu đề -->
      <div class="mb-6 max-w-3xl">
        <h1 class="mb-3 text-3xl font-bold tracking-tight text-gray-900 md:text-5xl">{{ $t('weather.pageTitle') }}</h1>
        <p class="text-lg leading-relaxed text-gray-600">{{ $t('weather.pageSubtitle') }}</p>
      </div>

      <!-- Chú giải màu -->
      <div class="mb-4 flex flex-wrap gap-2 text-xs font-bold">
        <span class="rounded-lg border border-emerald-300 bg-emerald-50 px-2 py-1 text-emerald-900">😊 {{ $t('weather.good') }}</span>
        <span class="rounded-lg border border-amber-300 bg-amber-50 px-2 py-1 text-amber-900">😐 {{ $t('weather.fair') }}</span>
        <span class="rounded-lg border border-rose-300 bg-rose-50 px-2 py-1 text-rose-900">😞 {{ $t('weather.bad') }}</span>
      </div>

      <div v-if="!du && !error" class="rounded-2xl border border-slate-200 bg-white p-4 text-sm text-slate-500">⛅ {{ $t('weather.loading') }}</div>
      <div v-else-if="!du" class="rounded-2xl border border-amber-300 bg-amber-50 p-4 text-sm text-amber-900">
        ⛅ {{ $t('weather.error') }}
        <button type="button" class="ml-2 font-bold underline" @click="refresh()">{{ $t('weather.retry') }}</button>
      </div>

      <section v-else class="rounded-2xl border border-slate-200 bg-white p-3 shadow-sm sm:p-4 md:p-6">
        <div class="mb-2 flex flex-wrap items-baseline justify-between gap-2">
          <h2 class="text-base font-bold text-slate-900 md:text-lg">⛅ {{ $t('weather.widgetTitle') }} — {{ du.ten }}</h2>
          <span class="text-xs text-slate-500">{{ $t('weather.widgetNote') }}</span>
        </div>

        <!-- ===== Nhận định ngày đang chọn ===== -->
        <div v-if="ngayChon && locale === 'vi' && ngayChon.nhanDinh" :class="['mb-2 rounded-lg border px-2 py-1.5', MAU_NHAN_DINH[ngayChon.nhanDinh.muc]]">
          <div class="flex flex-wrap items-start gap-x-2 gap-y-1">
            <span class="shrink-0 rounded px-1.5 py-0.5 text-[11px] font-black tracking-wide ring-1 ring-current/30">
              {{ BIEU_TUONG_NHAN_DINH[ngayChon.nhanDinh.muc] }} {{ NHAN_NHAN_DINH[ngayChon.nhanDinh.muc] }}
            </span>
            <span v-if="ngayChon.chuyenGia" class="shrink-0 rounded bg-white/70 px-1.5 py-0.5 text-[11px] font-black ring-1 ring-current/20">
              {{ ngayChon.chuyenGia.diem }}<span class="font-normal opacity-60">/100</span>
              <span class="ml-1 font-semibold opacity-70">tin cậy {{ ngayChon.chuyenGia.doTinCay }}%</span>
            </span>
            <span class="w-full basis-full text-[12px] font-semibold leading-snug sm:w-auto sm:flex-1 sm:basis-auto">
              <span class="mr-1 rounded bg-white/70 px-1 py-0.5 text-[11px] font-black uppercase tracking-wide ring-1 ring-current/20">{{ tieuDeNgayVi(ngayChon.ngay) }}</span>
              {{ ngayChon.nhanDinh.tomTat.replace(/^[^—]*— /, '') }}
            </span>
          </div>
          <div v-if="ngayChon.chuyenGiaNguoi" class="mt-1 rounded-lg border-2 border-current/40 bg-white/80 px-2 py-1 text-[12px] leading-snug">
            <span class="mr-1 rounded bg-current/10 px-1 py-0.5 text-[10px] font-black uppercase tracking-wide">👤 Chuyên gia{{ ngayChon.chuyenGiaNguoi.boi ? ` · ${ngayChon.chuyenGiaNguoi.boi}` : '' }}</span>
            <strong>{{ ngayChon.chuyenGiaNguoi.ket === 'tot' ? 'Bay tốt' : ngayChon.chuyenGiaNguoi.ket === 'han-che' ? 'Bay hạn chế' : 'Nghỉ bay' }}</strong>
            <span v-if="ngayChon.chuyenGiaNguoi.khung"> · đẹp {{ ngayChon.chuyenGiaNguoi.khung }}</span>
            <span v-if="ngayChon.chuyenGiaNguoi.ghiChu"> — {{ ngayChon.chuyenGiaNguoi.ghiChu }}</span>
            <span v-if="ngayChon.mucMay && ngayChon.mucMay !== ngayChon.muc" class="ml-1 opacity-60">(máy chấm {{ ngayChon.mucMay === 'xanh' ? 'bay được' : ngayChon.mucMay === 'vang' ? 'hạn chế' : 'không bay' }})</span>
          </div>
          <div v-if="ngayChon.nhanDinh.kieuNgay" class="mt-1 text-[12px] font-bold leading-snug">🧭 {{ ngayChon.nhanDinh.kieuNgay }}</div>
          <div v-if="ngayChon.ngayGiong?.length" class="mt-1.5 rounded-lg bg-white/60 px-2 py-1 text-[11px] leading-snug">
            <div class="font-bold">📒 Ngày giống trong sổ kinh nghiệm</div>
            <ul class="mt-0.5 space-y-0.5">
              <li v-for="g in ngayChon.ngayGiong.slice(0, 3)" :key="g.ngay">
                <strong>{{ g.ngay.slice(8, 10) }}/{{ g.ngay.slice(5, 7) }}</strong>
                <span :class="g.ket === 'tot' ? 'text-emerald-700' : g.ket === 'han-che' ? 'text-amber-700' : 'text-rose-700'">{{ g.ket === 'tot' ? ' bay tốt' : g.ket === 'han-che' ? ' hạn chế' : ' nghỉ bay' }}</span>
                <span v-if="g.ghiChu"> — “{{ g.ghiChu }}”</span>
                <span class="opacity-60"> (gió {{ g.gioMax }} · giật {{ g.giatMax }})</span>
              </li>
            </ul>
          </div>
          <div class="mt-1.5 sm:columns-2 sm:gap-x-4">
            <div v-for="d in ngayChon.nhanDinh.diem" :key="d.ten" :class="['mb-0.5 break-inside-avoid text-[11px] leading-snug', MAU_TONG[d.tong]]">
              <span class="mr-1">{{ d.icon }}</span><span class="font-bold">{{ d.ten }}:</span> {{ d.noiDung }}
            </div>
          </div>
          <div v-if="ngayChon.thermal" class="mt-1.5 rounded border border-current/20 bg-white/60 px-2 py-1 text-[11px] leading-snug">
            <div class="flex flex-wrap items-center gap-x-2 gap-y-0.5">
              <span class="font-bold">🔥 Tiềm năng thermal:</span>
              <span :class="['font-black uppercase', ngayChon.thermal.muc === 'gat' ? 'text-rose-800' : ngayChon.thermal.muc === 'manh' ? 'text-orange-800' : '']">{{ $t('weather.thermalLevels.' + ngayChon.thermal.muc) }}</span>
              <span class="rounded bg-white/80 px-1 font-bold ring-1 ring-current/20">{{ ngayChon.thermal.diem }}/100</span>
              <span v-if="ngayChon.thermal.khung">mạnh nhất <strong>{{ ngayChon.thermal.khung }}</strong></span>
              <span v-if="ngayChon.thermal.gioDung > 0" class="opacity-80">· {{ ngayChon.thermal.gioDung }} giờ có thermal</span>
            </div>
            <div v-for="(l, i) in ngayChon.thermal.lyDo" :key="i">• {{ l }}</div>
            <div v-for="(c, i) in ngayChon.thermal.canhBao" :key="'c' + i" class="font-bold text-rose-800">⚠ {{ c }}</div>
          </div>
          <div v-if="ngayChon.nhanDinh.khuyenCao.length" class="mt-1.5 rounded border border-current/20 bg-white/60 px-2 py-1 text-[11px] leading-snug">
            <div class="font-bold">👉 Khuyến cáo</div>
            <div v-for="(k, i) in ngayChon.nhanDinh.khuyenCao" :key="i" :class="i === 0 ? 'font-bold' : ''">• {{ k }}</div>
          </div>
        </div>

        <!-- Thứ tiếng khác: tóm tắt bằng số liệu + nhãn đã dịch -->
        <div v-else-if="ngayChon" :class="['mb-2 rounded-xl border p-2.5', VIEN[ngayChon.muc]]">
          <div class="flex flex-wrap items-center gap-x-2 gap-y-1">
            <span class="text-sm font-black">{{ nhanMuc(ngayChon.muc) }}</span>
            <span v-if="ngayChon.chuyenGia" class="rounded-lg bg-white/70 px-1.5 py-0.5 text-xs font-bold text-slate-700">{{ ngayChon.chuyenGia.diem }}/100 · {{ $t('weather.confidence') }} {{ ngayChon.chuyenGia.doTinCay }}%</span>
            <span v-if="ngayChon.khungDep" class="text-xs font-semibold">{{ $t('weather.bestWindow') }}: <strong>{{ ngayChon.khungDep }}</strong></span>
          </div>
          <p class="mt-1 text-xs leading-snug text-slate-700">{{ ngayChon.muc === 'xanh' ? $t('weather.verdictGood') : ngayChon.muc === 'vang' ? $t('weather.verdictFair') : $t('weather.verdictBad') }}</p>
          <!-- Lời chuyên gia người (từ sổ mebayluon) — đè lên máy -->
          <div v-if="ngayChon.chuyenGiaNguoi" class="mt-1 rounded-lg border-2 border-current/40 bg-white/80 px-2 py-1 text-[12px] leading-snug" :title="$t('weather.expert.note')">
            <span class="mr-1 rounded bg-current/10 px-1 py-0.5 text-[10px] font-black uppercase tracking-wide">👤 {{ $t('weather.expert.label') }}{{ ngayChon.chuyenGiaNguoi.boi ? ` · ${ngayChon.chuyenGiaNguoi.boi}` : '' }}</span>
            <strong>{{ ngayChon.chuyenGiaNguoi.ket === 'tot' ? $t('weather.expert.good') : ngayChon.chuyenGiaNguoi.ket === 'han-che' ? $t('weather.expert.limited') : $t('weather.expert.rest') }}</strong>
            <span v-if="ngayChon.chuyenGiaNguoi.khung"> · {{ $t('weather.expert.window') }} {{ ngayChon.chuyenGiaNguoi.khung }}</span>
            <span v-if="ngayChon.chuyenGiaNguoi.ghiChu"> — {{ ngayChon.chuyenGiaNguoi.ghiChu }}</span>
          </div>
          <ul class="mt-1.5 grid grid-cols-1 gap-x-4 gap-y-0.5 text-xs text-slate-700 sm:grid-cols-2">
            <li v-for="d in tomTatNgay" :key="d.nhan" class="flex items-baseline gap-1">
              <span aria-hidden="true">{{ d.icon }}</span><span class="text-slate-500">{{ d.nhan }}:</span><strong class="font-semibold">{{ d.giaTri }}</strong>
            </li>
          </ul>
        </div>

        <!-- ===== Dải 10 ngày ===== -->
        <p class="mb-1 text-[11px] text-slate-500">{{ $t('weather.selectDay') }}</p>
        <div class="grid grid-cols-4 gap-1.5 sm:grid-cols-5 lg:grid-cols-10 lg:gap-1">
          <button v-for="n in du.ngay" :key="n.ngay" type="button" @click="chon = n.ngay"
            :class="['rounded-xl border px-1 py-1.5 text-center transition hover:brightness-95', chon === n.ngay ? 'border-orange-500 bg-orange-200 text-orange-950 shadow-md ring-2 ring-orange-500' : VIEN[n.muc]]">
            <div class="text-[11px] font-bold uppercase tracking-wide opacity-80">{{ nhanNgayHienThi(n.ngay) }}</div>
            <div class="mt-0.5 flex justify-center">
              <span class="whitespace-nowrap rounded-md px-1.5 py-0.5 leading-none" :style="styleGio(n.gioMax, du.nguong)" :title="`${$t('weather.wind')} ${n.gioMax.toFixed(1)} ${$t('weather.windUnit')}`">
                <span v-if="huongTroi(n) !== null" class="text-[11px] font-black">{{ tenHuong(huongTroi(n) as number) }} · </span>
                <span class="text-[15px] font-black">{{ n.gioMax.toFixed(1) }}</span>
                <span class="text-[10px] font-bold opacity-80"> {{ $t('weather.windUnit') }}</span>
              </span>
            </div>
            <div v-if="n.chuyenGia || n.gioXanh > 0 || n.gioMua > 0 || n.xacSuatDongMax >= 20" class="mt-0.5 flex flex-wrap items-center justify-center gap-x-1 text-[11px] font-semibold leading-tight">
              <span v-if="n.chuyenGia" class="font-black" :title="`${$t('weather.score')} ${n.chuyenGia.diem}/100`">{{ n.chuyenGia.diem }}<span class="font-bold opacity-60">/100</span></span>
              <span v-if="n.gioXanh > 0" class="break-words leading-tight">{{ n.gioXanh }} {{ $t('weather.goodHours') }}</span>
              <span v-if="n.gioMua > 0" class="font-normal">☔{{ n.gioMua }}h</span>
              <span v-if="n.xacSuatDongMax >= 20">⚡{{ n.xacSuatDongMax }}%</span>
            </div>
            <div v-if="n.muc !== 'xanh'" class="mt-0.5 whitespace-nowrap text-[10px] font-black leading-tight">{{ nhanMuc(n.muc) }}</div>
            <div v-if="hoangHonDep(n)" class="mt-0.5 text-[10px] font-bold leading-tight text-orange-700">🌅 {{ $t('weather.goodSunset') }}</div>
          </button>
        </div>

        <!-- ===== Vị trí bãi + mặt trời ===== -->
        <div class="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 rounded-xl border border-slate-200 bg-slate-50 px-2 py-1.5 text-xs text-slate-600">
          <span class="font-bold text-slate-800">📍 {{ du.toaDo.ten }}</span>
          <span class="tabular-nums">{{ du.toaDo.lat.toFixed(4) }}, {{ du.toaDo.lon.toFixed(4) }}{{ du.toaDo.alt ? ` · ${du.toaDo.alt}m` : '' }}</span>
          <span v-if="du.toaDo.alt !== undefined && du.toaDo.altHa !== undefined" class="font-semibold text-slate-700">▲ {{ $t('weather.takeoff') }} {{ du.toaDo.alt }}m → ▼ {{ $t('weather.landing') }} {{ du.toaDo.altHa }}m · {{ $t('weather.heightDiff') }} {{ du.toaDo.alt - du.toaDo.altHa }}m</span>
          <span v-if="ngayChon?.matTroi" class="font-semibold text-amber-700">☀ {{ $t('weather.sunrise') }} {{ ngayChon.matTroi.moc }} · {{ $t('weather.sunset') }} {{ ngayChon.matTroi.lan }}{{ daiNgay ? ` (${daiNgay})` : '' }}</span>
        </div>
        <div v-if="ngayChon?.khungDep" class="mt-2 text-xs font-semibold text-slate-700">{{ $t('weather.bestWindow') }}: <span class="text-emerald-700">{{ ngayChon.khungDep }}</span></div>

        <!-- ===== Mô hình + so sánh ===== -->
        <div class="mt-2 flex flex-wrap items-center gap-1">
          <span class="text-[11px] font-bold text-slate-500">{{ $t('weather.modelLabel') }}:</span>
          <button v-for="m in MO_HINH" :key="m.ma" type="button" :title="m.mo" @click="moHinh = m.ma"
            :class="['rounded-lg border px-2 py-0.5 text-[11px] font-bold', moHinh === m.ma && !soSanh ? 'border-blue-600 bg-blue-600 text-white' : 'border-slate-300 bg-white text-slate-700']">
            {{ m.ten }}
          </button>
          <button type="button" @click="soSanh = !soSanh"
            :class="['ml-1 rounded-lg border px-2 py-0.5 text-[11px] font-bold', soSanh ? 'border-violet-600 bg-violet-600 text-white' : 'border-violet-300 bg-violet-50 text-violet-800']">
            {{ $t('weather.compare.toggle') }}
          </button>
        </div>

        <!-- ===== Kiểu xem ===== -->
        <div v-if="ngayChon" class="mt-1.5 flex flex-wrap gap-1">
          <button v-for="v in (['basic', 'meteogram', 'airgram', 'skewt'] as const)" :key="v" type="button" @click="kieuXem = v"
            :class="['rounded-lg border px-2 py-0.5 text-xs font-bold', kieuXem === v ? 'border-blue-600 bg-blue-600 text-white' : 'border-slate-300 bg-white text-slate-700']">
            {{ $t('weather.tabs.' + v) }}
          </button>
        </div>

        <template v-if="ngayChon">
          <WeatherSkewT v-if="kieuXem === 'skewt'" :ngay="ngayChon.ngay" :mo-hinh="moHinh" :alt-bai="du.toaDo.alt ?? 0" :alt-ha="du.toaDo.altHa" :alt-cat2="du.toaDo.altCat2" />
          <WeatherMeteogram v-else-if="kieuXem === 'meteogram'" :ngay="du.ngay" :nguong="du.nguong" :alt-bai="du.toaDo.alt ?? 0" :ngay-chon="chon" :nhan="nhanBieuDo" @ngay-hien="chon = $event" />
          <WeatherAirgram v-else-if="kieuXem === 'airgram'" :ngay="du.ngay" :nguong="du.nguong" :alt-bai="du.toaDo.alt ?? 0" :alt-ha="du.toaDo.altHa" :alt-cat2="du.toaDo.altCat2" :ngay-chon="chon" :nhan="nhanBieuDo" @ngay-hien="chon = $event" />
          <WeatherHourlyTable v-else :ngay="du.ngay" :ngay-chon="chon" :luat="du.toaDo.luatHuong" :nguong="du.nguong" :alt="du.toaDo.alt ?? 0" @ngay-hien="chon = $event" />
        </template>

        <WeatherModelCompare v-if="soSanh" :ngay-chon="chon" :hom-nay="homNay" @chon-ngay="chon = $event" />

        <!-- ===== Riêng Sa Pa: mù · gió trên cao · luật hướng gió ===== -->
        <div v-if="ngayChon && mu && gioCao" class="mt-3 grid grid-cols-1 gap-2 md:grid-cols-2">
          <!-- MÙ VÀ MÂY THẤP -->
          <div :class="['rounded-xl border p-2.5 text-xs', MAU_MU_NGUY_CO[mu.nguyCo]]">
            <div class="flex flex-wrap items-center gap-x-2 gap-y-1">
              <span class="text-sm font-black">🌫 {{ $t('weather.fog.title') }}</span>
              <span class="rounded bg-white/70 px-1.5 py-0.5 text-[11px] font-black ring-1 ring-current/20">{{ $t('weather.fog.risk.' + mu.nguyCo) }}</span>
            </div>
            <!-- Dải giờ 7–17h -->
            <div class="mt-1.5 flex gap-0.5">
              <div v-for="g in mu.gio" :key="g.gio" class="flex-1 text-center" :title="`${g.gio.slice(11, 16)} · ${$t('weather.fog.levels.' + g.muc)}`">
                <div :class="['h-2 rounded-sm', MAU_MU_GIO[g.muc]]" />
                <div class="mt-0.5 text-[9px] leading-none text-slate-500">{{ g.gio.slice(11, 13) }}</div>
              </div>
            </div>
            <div class="mt-1.5 flex flex-wrap gap-x-2 text-[10px] text-slate-600">
              <span v-for="m in (['quang', 'hanChe', 'trumBai', 'muDay'] as const)" :key="m" class="inline-flex items-center gap-1"><span :class="['inline-block h-2 w-3 rounded-sm', MAU_MU_GIO[m]]" />{{ $t('weather.fog.levels.' + m) }}</span>
            </div>
            <p class="mt-1.5 font-semibold leading-snug">
              <template v-if="mu.gioXau === 0 && mu.gioHanChe === 0">{{ $t('weather.fog.noFog') }}</template>
              <template v-else-if="mu.caNgay">{{ $t('weather.fog.allDay') }}</template>
              <template v-else>
                <template v-if="mu.tanLuc">{{ $t('weather.fog.clearsAt') }} <strong>{{ mu.tanLuc }}</strong>. </template>
                <template v-if="mu.trumLaiLuc">{{ $t('weather.fog.returnsAt') }} <strong>{{ mu.trumLaiLuc }}</strong>.</template>
              </template>
            </p>
            <ul class="mt-1 grid grid-cols-1 gap-x-3 gap-y-0.5 text-[11px] text-slate-700 sm:grid-cols-2">
              <li v-if="mu.gioXau > 0"><span class="text-slate-500">⏱</span> <strong>{{ mu.gioXau }}</strong> {{ $t('weather.fog.badHours') }}</li>
              <li v-if="mu.chenhMin !== null"><span class="text-slate-500">{{ $t('weather.fog.spread') }}:</span> <strong>{{ mu.chenhMin }}°C</strong></li>
              <li><span class="text-slate-500">{{ $t('weather.fog.humidity') }}:</span> <strong>{{ mu.amMax }}%</strong></li>
              <li><span class="text-slate-500">{{ $t('weather.fog.lowCloud') }}:</span> <strong>{{ mu.mayThapMax }}%</strong></li>
              <li v-if="mu.tranMin !== null"><span class="text-slate-500">{{ $t('weather.fog.baseMin') }}:</span> <strong>~{{ mu.tranMin }}m</strong></li>
            </ul>
            <p class="mt-1.5 text-[11px] leading-snug text-slate-600">{{ $t('weather.fog.landingNote') }}</p>
            <details class="mt-1 text-[11px] text-slate-600">
              <summary class="cursor-pointer font-semibold">ℹ️ {{ $t('weather.khiTuongTieuDe') }}</summary>
              <p v-for="(p, i) in fogTips" :key="i" class="mt-1 leading-snug">{{ p }}</p>
            </details>
          </div>

          <div class="flex flex-col gap-2">
            <!-- GIÓ TRÊN CAO -->
            <div :class="['rounded-xl border p-2.5 text-xs', VIEN[gioCao.muc]]">
              <div class="text-sm font-black">🪁 {{ $t('weather.upper.title') }}</div>
              <p class="mt-1 font-semibold leading-snug">
                {{ gioCao.muc === 'do' ? $t('weather.upper.bad', { h: moTaGioCao }) : gioCao.muc === 'vang' ? $t('weather.upper.warn', { h: moTaGioCao }) : $t('weather.upper.ok') }}
              </p>
              <ul class="mt-1 space-y-0.5 text-[11px] text-slate-700">
                <li v-if="gioCao.max500 !== null"><span class="text-slate-500">{{ $t('weather.upper.plus500') }} · {{ $t('weather.upper.strongest') }}:</span> <strong>{{ gioCao.max500.toFixed(0) }} m/s{{ gioCao.huongMax !== null ? ` ${tenHuong(gioCao.huongMax)}` : '' }}</strong>{{ gioCao.gioMax ? ` · ${gioCao.gioMax}` : '' }}</li>
                <li v-if="gioCao.max850 !== null"><span class="text-slate-500">{{ $t('weather.upper.at850') }}:</span> <strong>{{ gioCao.max850.toFixed(0) }} m/s{{ gioCao.huong850 !== null ? ` ${tenHuong(gioCao.huong850)}` : '' }}</strong></li>
                <li v-if="gioCao.max700 !== null"><span class="text-slate-500">{{ $t('weather.upper.at700') }}:</span> <strong>{{ gioCao.max700.toFixed(0) }} m/s{{ gioCao.huong700 !== null ? ` ${tenHuong(gioCao.huong700)}` : '' }}</strong></li>
              </ul>
            </div>
            <!-- LUẬT HƯỚNG GIÓ -->
            <div class="rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs text-slate-700">
              <div class="text-sm font-black text-slate-800">🧭 {{ $t('weather.windRules.title') }}</div>
              <ul class="mt-1 list-disc space-y-0.5 pl-4 text-[11px] leading-snug">
                <li v-for="c in du.toaDo.luatHuong?.capToc ?? []" :key="c.tam.join(',')">{{ $t('weather.windRules.item', { dir: tenHuong(c.tam[0] ?? 0), max: c.max }) }}</li>
                <li>{{ $t('weather.windRules.upperItem') }}</li>
              </ul>
              <p class="mt-1 text-[10px] text-slate-500">{{ $t('weather.windRules.source') }}</p>
            </div>
          </div>
        </div>

        <!-- ===== Bản đồ Windy ===== -->
        <button type="button" class="mt-3 rounded-lg border border-blue-300 bg-blue-50 px-3 py-1.5 text-xs font-bold text-blue-800 hover:bg-blue-100" @click="moBanDo = !moBanDo">
          {{ moBanDo ? $t('weather.mapToggleClose') : $t('weather.mapToggleOpen') }}
        </button>
        <div v-if="moBanDo" class="mt-2">
          <div class="mb-1 flex flex-wrap items-center gap-1">
            <button v-for="l in WINDY_LAYERS" :key="l" type="button" :class="['rounded-lg border px-2 py-0.5 text-xs font-bold', lopWindy === l ? 'border-emerald-600 bg-emerald-600 text-white' : 'border-slate-300 bg-white text-slate-700']" @click="lopWindy = l">{{ $t('weather.windyLayers.' + l) }}</button>
          </div>
          <div class="mb-1 flex flex-wrap gap-1">
            <button v-for="m in WINDY_MODELS" :key="m.id" type="button" :class="['rounded-lg border px-2 py-0.5 text-xs font-bold', moHinhWindy === m.id ? 'border-blue-600 bg-blue-600 text-white' : 'border-slate-300 bg-white text-slate-700']" @click="moHinhWindy = m.id">{{ m.ten }}</button>
          </div>
          <div class="overflow-hidden rounded-xl border border-slate-200">
            <iframe :key="`${moHinhWindy}:${lopWindy}`" :title="`Windy — ${du.toaDo.ten}`" :src="windyEmbedUrl(du.toaDo.lat, du.toaDo.lon, moHinhWindy, lopWindy)" class="h-[400px] w-full" loading="lazy" />
          </div>
          <div class="mt-1 flex flex-wrap gap-1">
            <a :href="windyPageUrl(du.toaDo.lat, du.toaDo.lon, 'meteogram')" target="_blank" rel="noopener noreferrer" class="rounded-lg border border-violet-300 bg-violet-50 px-2 py-0.5 text-xs font-bold text-violet-800 hover:bg-violet-100">📊 Meteogram · Windy ↗</a>
            <a :href="windyPageUrl(du.toaDo.lat, du.toaDo.lon, 'airgram')" target="_blank" rel="noopener noreferrer" class="rounded-lg border border-violet-300 bg-violet-50 px-2 py-0.5 text-xs font-bold text-violet-800 hover:bg-violet-100">🪂 Airgram · Windy ↗</a>
          </div>
        </div>

        <p class="mt-3 text-xs leading-relaxed text-slate-500">{{ $t('weather.disclaimer') }}</p>
        <p class="mt-0.5 text-xs leading-relaxed text-slate-400">{{ $t('weather.source') }}: {{ du.moHinh }} · {{ $t('weather.updated') }}: {{ gioCapNhat }}</p>
        <a href="https://www.mebayluon.com/thoi-tiet-bay" target="_blank" rel="noopener" class="mt-2 inline-flex items-center gap-1 rounded-lg border border-[#194d9b]/30 bg-blue-50 px-3 py-1.5 text-xs font-bold text-[#194d9b] hover:bg-blue-100">
          🗺 {{ $t('weather.moreSites') }} ↗
        </a>
      </section>

      <div class="mt-8 text-center">
        <NuxtLink :to="localePath('/booking')" class="inline-flex items-center rounded-xl bg-gradient-to-r from-red-500 to-red-600 px-8 py-4 font-semibold text-white shadow-lg transition-all duration-300 hover:from-red-600 hover:to-red-700 hover:shadow-xl">
          <svg class="mr-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>
          {{ $t('weather.bookNow') }}
        </NuxtLink>
      </div>

      <div class="mt-10 max-w-3xl space-y-3 text-base leading-relaxed text-gray-600">
        <p v-for="(p, i) in intro" :key="i">{{ p }}</p>
      </div>

      <section class="mt-8 rounded-2xl border border-gray-200 bg-white p-6 md:p-8">
        <h2 class="mb-4 text-2xl font-bold text-gray-900">{{ $t('weather.khiTuongTieuDe') }}</h2>
        <div class="space-y-5 lg:columns-2 lg:gap-8 lg:space-y-0">
          <article v-for="m in khiTuong" :key="m.tieuDe" class="break-inside-avoid lg:mb-5">
            <h3 class="text-sm font-bold uppercase tracking-wide text-[#194d9b]">{{ m.tieuDe }}</h3>
            <p v-for="(doan, i) in m.y" :key="i" class="mt-1.5 text-sm leading-relaxed text-gray-600">{{ doan }}</p>
          </article>
        </div>
      </section>
    </div>
  </main>
</template>

<script setup lang="ts">
import { buildBreadcrumbJsonLD, buildHreflangLinks, buildLocalizedUrl, getCanonicalUrl, getDefaultOgImage, getOgLocale } from '~/utils/seo'
import {
  BIEU_TUONG_MUC, MO_HINH, MO_HINH_MAC_DINH, MUA_BAY, WINDY_LAYERS, WINDY_MODELS,
  gioNangCuaNgay, gioTrenBai, hoangHonDep, huongTroiNgay, phanTichGioCao, phanTichMu, styleGio, trongCung, windyEmbedUrl, windyPageUrl,
  type DuBaoSapa, type MucDo, type MucMu, type NgayTT
} from '~/utils/weather'
import { useWeatherI18n } from '~/composables/useWeatherI18n'
import type { NhanMeteogram } from '~/components/weather/WeatherMeteogram.vue'

const { locale, t, tenHuong, homNay, nhanNgayHienThi, mang, layChuoi } = useWeatherI18n()
const { tm } = useI18n()
const localePath = useLocalePath()
const route = useRoute()

/* ------------------------------------------------------------------ */
/* Dữ liệu — chỉ lấy ở trình duyệt, đổi mô hình là lấy lại            */
/* ------------------------------------------------------------------ */

const moHinh = ref<string>(MO_HINH_MAC_DINH)
const { data: du, error, refresh } = await useFetch<DuBaoSapa>('/api/weather', {
  key: 'weather-sapa',
  server: false,
  lazy: true,
  query: { model: moHinh }
})

const chon = ref<string | null>(null)
watch(du, (d) => {
  if (!d?.ngay?.length) return
  /** Đổi mô hình thì giữ nguyên ngày đang xem — người ta đang so cùng một ngày. */
  if (!chon.value || !d.ngay.some((n) => n.ngay === chon.value)) chon.value = d.ngay[0]!.ngay
}, { immediate: true })
const ngayChon = computed<NgayTT | null>(() => du.value?.ngay.find((n) => n.ngay === chon.value) ?? du.value?.ngay[0] ?? null)

/** Cho phép mở thẳng một tab qua địa chỉ: /weather?view=skewt&compare=1 (chia sẻ link, và để kiểm thử). */
type KieuXem = 'basic' | 'meteogram' | 'airgram' | 'skewt'
const KIEU_XEM: KieuXem[] = ['basic', 'meteogram', 'airgram', 'skewt']
const viewBanDau = String(route.query.view ?? '')
const soSanh = ref(route.query.compare === '1')
const kieuXem = ref<KieuXem>(KIEU_XEM.includes(viewBanDau as KieuXem) ? (viewBanDau as KieuXem) : 'basic')
const moBanDo = ref(false)
const lopWindy = ref<(typeof WINDY_LAYERS)[number]>('wind')
const moHinhWindy = ref<string>('ecmwf')

/* ------------------------------------------------------------------ */
/* Màu & nhãn                                                          */
/* ------------------------------------------------------------------ */

const VIEN: Record<MucDo, string> = {
  xanh: 'border-emerald-300 bg-emerald-50 text-emerald-900',
  vang: 'border-amber-300 bg-amber-50 text-amber-900',
  do: 'border-rose-300 bg-rose-50 text-rose-900'
}
const MAU_NHAN_DINH: Record<string, string> = {
  tot: 'border-emerald-300 bg-emerald-50 text-emerald-900', kha: 'border-blue-300 bg-blue-50 text-blue-900',
  hanChe: 'border-amber-300 bg-amber-50 text-amber-900', nghi: 'border-rose-300 bg-rose-50 text-rose-900'
}
const NHAN_NHAN_DINH: Record<string, string> = { tot: 'NGÀY BAY TỐT', kha: 'NGÀY BAY KHÁ', hanChe: 'NGÀY BAY HẠN CHẾ', nghi: 'NÊN NGHỈ BAY' }
const BIEU_TUONG_NHAN_DINH: Record<string, string> = { tot: '😊', kha: '🙂', hanChe: '😐', nghi: '😞' }
const MAU_TONG: Record<string, string> = { tot: 'text-emerald-800', chuY: 'text-amber-800', xau: 'font-bold text-rose-800', thongTin: 'text-slate-700' }
const MAU_MU_NGUY_CO: Record<'thap' | 'vua' | 'cao', string> = {
  thap: 'border-emerald-300 bg-emerald-50 text-emerald-900', vua: 'border-amber-300 bg-amber-50 text-amber-900', cao: 'border-rose-300 bg-rose-50 text-rose-900'
}
const MAU_MU_GIO: Record<MucMu, string> = { quang: 'bg-emerald-300', hanChe: 'bg-slate-300', trumBai: 'bg-slate-500', muDay: 'bg-slate-700' }

const nhanMuc = (muc: MucDo) => (muc === 'do' ? BIEU_TUONG_MUC.do : `${BIEU_TUONG_MUC[muc]} ${muc === 'xanh' ? t('weather.good') : t('weather.fair')}`)
const THU_VI = ['CHỦ NHẬT', 'THỨ HAI', 'THỨ BA', 'THỨ TƯ', 'THỨ NĂM', 'THỨ SÁU', 'THỨ BẢY']
const tieuDeNgayVi = (d: string) => `${THU_VI[new Date(`${d}T12:00:00+07:00`).getDay()]} ${d.slice(8, 10)}/${d.slice(5, 7)}`
const huongTroi = (n: NgayTT) => huongTroiNgay(n.gio, [6, 18])

const nhanBieuDo = computed<NhanMeteogram>(() => ({
  gio: t('weather.hour'), troi: t('weather.sky'), gioMs: `${t('weather.wind')} ${t('weather.windUnit')}`, giat: t('weather.gust'),
  may: t('weather.cloud'), mua: `${t('weather.rain')} mm`, tran: t('weather.cloudBase'), matDat: t('weather.ground'),
  batDau: t('weather.takeoff'), haCanh: t('weather.landing'), amsl: 'm AMSL', vuot: t('weather.swipeDays')
}))

const daiNgay = computed(() => {
  const mt = ngayChon.value?.matTroi
  if (!mt) return null
  const p = (x: string) => Number(x.slice(0, 2)) * 60 + Number(x.slice(3, 5))
  const m = p(mt.lan) - p(mt.moc)
  return m > 0 ? `${Math.floor(m / 60)}h${String(m % 60).padStart(2, '0')}` : null
})
const gioCapNhat = computed(() => {
  const luc = du.value?.layLuc
  if (!luc) return ''
  return new Date(luc).toLocaleString(locale.value === 'vi' ? 'vi-VN' : 'en-GB', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit', timeZone: 'Asia/Ho_Chi_Minh' })
})

/* ------------------------------------------------------------------ */
/* Riêng Sa Pa: mù, gió trên cao                                       */
/* ------------------------------------------------------------------ */

const mu = computed(() => (ngayChon.value ? phanTichMu(ngayChon.value) : null))
const gioCao = computed(() => (ngayChon.value ? phanTichGioCao(ngayChon.value, du.value?.toaDo.alt ?? 0) : null))
const moTaGioCao = computed(() => {
  const g = gioCao.value
  if (!g || g.max500 === null) return ''
  return `${g.max500.toFixed(0)} m/s${g.huongMax !== null ? ` ${tenHuong(g.huongMax)}` : ''}${g.gioMax ? ` · ${g.gioMax}` : ''}`
})
const fogTips = computed(() => mang('weather.fog.tips'))

/* ------------------------------------------------------------------ */
/* Tóm tắt ngày cho thứ tiếng khác tiếng Việt                          */
/* ------------------------------------------------------------------ */

const tomTatNgay = computed<Array<{ icon: string; nhan: string; giaTri: string }>>(() => {
  const ngay = ngayChon.value
  const d = du.value
  if (!ngay || !d) return []
  const unit = t('weather.windUnit')
  const dong: Array<{ icon: string; nhan: string; giaTri: string }> = []
  const gioTb = ngay.gio.length ? ngay.gio.reduce((a, g) => a + g.gio10m, 0) / ngay.gio.length : 0
  const mayTb = ngay.gio.length ? Math.round(ngay.gio.reduce((a, g) => a + g.may, 0) / ngay.gio.length) : 0
  const giua = ngay.gio[Math.floor(ngay.gio.length / 2)]
  dong.push({ icon: '🌬', nhan: `${t('weather.wind')} ${unit}`, giaTri: `${gioTb.toFixed(1)} → ${ngay.gioMax.toFixed(1)}${giua ? ` ${tenHuong(giua.huong)}` : ''}` })
  const gust = ngay.gio.filter((g) => g.giat > 16)
  if (gust.length) {
    const khung = gust.length === 1 ? gust[0]!.gio.slice(11, 16) : `${gust[0]!.gio.slice(11, 16)}–${gust[gust.length - 1]!.gio.slice(11, 16)}`
    dong.push({ icon: '💨', nhan: t('weather.strongGusts'), giaTri: `${khung} · ${ngay.giatMax.toFixed(0)} ${unit}` })
  }
  dong.push({
    icon: ngay.gioMua > 0 ? '🌧' : ngay.gioMuaBay > 0 ? '🌦' : '☀️', nhan: t('weather.rain'),
    giaTri: ngay.gioMua > 0
      ? `${ngay.gioMua}${t('weather.hourShort')}${ngay.khungMua ? ` (${ngay.khungMua})` : ''} · ${ngay.muaTongThat.toFixed(1)}mm`
      : ngay.gioMuaBay > 0 ? `${t('weather.lightRain')}${ngay.khungMuaBay ? ` · ${ngay.khungMuaBay}` : ''}` : t('weather.noRain')
  })
  if (ngay.xacSuatDongMax >= 20) dong.push({ icon: '⚡', nhan: t('weather.storm'), giaTri: `${ngay.xacSuatDongMax}%` })
  const alt = d.toaDo.alt ?? 0
  const mucGio = [300, 500, 1000].map((m) => {
    const v = ngay.gio.map((g) => gioTrenBai(g, m, alt)).filter((x): x is number => typeof x === 'number')
    return v.length ? v.reduce((a, b) => a + b, 0) / v.length : null
  })
  if (mucGio.some((v) => v !== null)) dong.push({ icon: '🪁', nhan: `${t('weather.upperWind')} 300/500/1000m`, giaTri: mucGio.map((v) => (v === null ? '–' : v.toFixed(0))).join('/') + ` ${unit}` })
  const nap = (() => {
    for (const g of ngay.gio) {
      const h = Number(g.gio.slice(11, 13))
      if (h < 10 || h > 15) continue
      const muc: Array<{ h: number; nhiet: number }> = []
      if (typeof g.h925 === 'number' && typeof g.t925 === 'number') muc.push({ h: g.h925, nhiet: g.t925 })
      if (typeof g.h850 === 'number' && typeof g.t850 === 'number') muc.push({ h: g.h850, nhiet: g.t850 })
      if (typeof g.t700 === 'number') muc.push({ h: 3000, nhiet: g.t700 })
      const tren = muc.filter((m) => m.h > alt).sort((a, b) => a.h - b.h)
      for (let i = 1; i < tren.length; i++) if (tren[i]!.nhiet >= tren[i - 1]!.nhiet - 0.2) return Math.round(tren[i - 1]!.h)
    }
    return null
  })()
  dong.push({ icon: '🧢', nhan: t('weather.inversion'), giaTri: nap === null ? t('weather.inversionNone') : `~${nap}m` })
  const cung = d.toaDo.luatHuong?.tot
  if (cung) {
    const hop = ngay.gio.filter((g) => trongCung(g.huong, cung) && g.gio10m >= 3 && g.mua < MUA_BAY)
    if (hop.length >= 2) {
      const manhNhat = hop.reduce((a, b) => (b.gio10m > a.gio10m ? b : a), hop[0]!)
      const cuc = hop.filter((g) => g.gio10m >= 4 && g.gio10m <= 6).length >= 2
      dong.push({ icon: '🪃', nhan: t('weather.ridge'), giaTri: `${cuc ? t('weather.ridgeVeryGood') : t('weather.ridgeGood')} · ${hop[0]!.gio.slice(11, 16)}–${hop[hop.length - 1]!.gio.slice(11, 16)} · ${hop[0]!.gio10m.toFixed(1)}–${manhNhat.gio10m.toFixed(1)} ${unit}` })
    }
  }
  const nang = gioNangCuaNgay(ngay)
  if (nang > 0) dong.push({ icon: '☀️', nhan: t('weather.sunHours'), giaTri: `${nang}` })
  const apTb = (n: NgayTT) => {
    const v = n.gio.map((g) => g.apSuat).filter((x): x is number => typeof x === 'number')
    return v.length ? v.reduce((a, b) => a + b, 0) / v.length : null
  }
  const ap = apTb(ngay)
  if (ap !== null) {
    const idx = d.ngay.findIndex((n) => n.ngay === ngay.ngay)
    const truoc = idx > 0 ? apTb(d.ngay[idx - 1]!) : null
    const chenh = truoc === null ? null : ap - truoc
    const xu = chenh === null ? '' : ` · ${chenh <= -1 ? t('weather.pressureFalling') : chenh >= 1 ? t('weather.pressureRising') : t('weather.pressureSteady')}${Math.abs(chenh) >= 0.5 ? ` ${chenh > 0 ? '+' : ''}${chenh.toFixed(1)}` : ''}`
    dong.push({ icon: '🌡', nhan: t('weather.pressure'), giaTri: `${ap.toFixed(0)} hPa${xu}` })
  }
  if (hoangHonDep(ngay)) dong.push({ icon: '🌅', nhan: t('weather.goodSunset'), giaTri: '' })
  if (ngay.thermal) {
    dong.push({ icon: '🔥', nhan: t('weather.thermalPotential'), giaTri: `${t('weather.thermalLevels.' + ngay.thermal.muc)} · ${ngay.thermal.diem}/100` + (ngay.thermal.khung && ngay.thermal.diem >= 25 ? ` · ${t('weather.thermalWindow')} ${ngay.thermal.khung}` : '') + (ngay.thermal.gioDung > 0 ? ` · ${ngay.thermal.gioDung} ${t('weather.thermalHours')}` : '') })
  } else if (ngay.tranMax) {
    dong.push({ icon: '🔥', nhan: t('weather.thermal'), giaTri: `~${ngay.tranMax} m` })
  }
  dong.push({ icon: '☁️', nhan: t('weather.cloudCover'), giaTri: `${mayTb}%` })
  return dong
})

/* ------------------------------------------------------------------ */
/* Phần chữ                                                            */
/* ------------------------------------------------------------------ */

const intro = computed(() => mang('weather.intro'))
const khiTuong = computed<Array<{ tieuDe: string; y: string[] }>>(() => {
  const raw = tm('weather.khiTuong') as unknown
  if (!Array.isArray(raw)) return []
  return raw.map((m) => {
    const o = m as { tieuDe: unknown; y: unknown[] }
    return { tieuDe: layChuoi(o.tieuDe), y: Array.isArray(o.y) ? o.y.map(layChuoi) : [] }
  })
})

/* ------------------------------------------------------------------ */
/* SEO                                                                 */
/* ------------------------------------------------------------------ */

const getWeatherSeoMeta = () => {
  const localeMetaMap: Record<string, { title: string; description: string }> = {
    vi: { title: 'Dự Báo Thời Tiết Bay Dù Lượn Sa Pa 10 Ngày | Sapa Paragliding', description: 'Dự báo thời tiết bay dù lượn Sa Pa 10 ngày tới cho đúng toạ độ bãi cất cánh: gió, mưa, mù, mây, thermal, gió tầng cao, Skew-T, so sánh mô hình. Chấm màu ngày bay tốt, cân nhắc, nên nghỉ.' },
    en: { title: 'Sapa Paragliding Weather Forecast: 10-Day Flying Conditions', description: '10-day paragliding weather forecast for the exact Sapa take-off: wind, rain, fog, cloud base, thermals, upper winds, Skew-T and model comparison, colour-coded good / marginal / no-fly.' },
    fr: { title: 'Météo Parapente Sapa : Prévisions de Vol sur 10 Jours', description: "Prévisions météo parapente à Sapa sur 10 jours aux coordonnées exactes du décollage : vent, pluie, brouillard, base des nuages, thermiques, vent d'altitude, Skew-T, comparaison de modèles." },
    ru: { title: 'Погода для параплана в Сапе: прогноз на 10 дней', description: 'Прогноз погоды для полётов на параплане в Сапе на 10 дней по точным координатам старта: ветер, дождь, туман, облачность, термики, ветер на высоте, Skew-T, сравнение моделей.' },
    zh: { title: '沙坝滑翔伞天气预报：未来10天飞行条件 | Sapa Paragliding', description: '沙坝滑翔伞起飞场精确坐标的10天天气预报：风、雨、雾、云底、热气流、高空风、Skew-T 与模式对比，按可飞/谨慎/停飞标色。' },
    hi: { title: 'सापा पैराग्लाइडिंग मौसम पूर्वानुमान: 10 दिन की उड़ान स्थितियाँ', description: 'सापा टेक-ऑफ़ की सटीक स्थिति के लिए 10 दिन का पैराग्लाइडिंग मौसम पूर्वानुमान: हवा, वर्षा, कोहरा, बादल आधार, थर्मल, ऊपरी हवाएँ, Skew-T और मॉडल तुलना।' }
  }
  return localeMetaMap[locale.value] || localeMetaMap.en!
}
const seoData = computed(() => getWeatherSeoMeta())
const canonicalUrl = computed(() => getCanonicalUrl(route, locale.value))
const hreflangLinks = computed(() => buildHreflangLinks(route.path, locale.value))
const ogImage = getDefaultOgImage()
const breadcrumbJsonLd = computed(() => buildBreadcrumbJsonLD([
  { name: t('menu.home'), item: buildLocalizedUrl('/', locale.value) },
  { name: t('menu.weather'), item: canonicalUrl.value }
]))
useHead(() => ({
  title: seoData.value.title,
  meta: [
    { name: 'description', content: seoData.value.description },
    { property: 'og:title', content: seoData.value.title },
    { property: 'og:description', content: seoData.value.description },
    { property: 'og:url', content: canonicalUrl.value },
    { property: 'og:type', content: 'website' },
    { property: 'og:locale', content: getOgLocale(locale.value) },
    { property: 'og:image', content: ogImage },
    { property: 'og:image:alt', content: seoData.value.title },
    { name: 'twitter:card', content: 'summary_large_image' },
    { name: 'twitter:title', content: seoData.value.title },
    { name: 'twitter:description', content: seoData.value.description },
    { name: 'twitter:image', content: ogImage }
  ],
  link: [{ rel: 'canonical', href: canonicalUrl.value }, ...hreflangLinks.value],
  script: [{ type: 'application/ld+json', innerHTML: JSON.stringify(breadcrumbJsonLd.value) }]
}))
</script>
