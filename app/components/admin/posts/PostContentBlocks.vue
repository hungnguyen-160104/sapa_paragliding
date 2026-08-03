<template>
  <div class="space-y-3">
    <div
      v-for="(block, index) in englishBlocks"
      :key="block.id"
      class="group relative rounded-xl border border-slate-200 bg-white transition-colors hover:border-slate-300"
    >
      <div class="absolute -left-10 top-1/2 flex -translate-y-1/2 flex-col gap-1 opacity-0 transition-opacity group-hover:opacity-100">
        <button
          class="rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
          :disabled="index === 0"
          title="Di chuyển lên"
          @click="moveBlock(index, 'up')"
        >
          <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 15l7-7 7 7" />
          </svg>
        </button>
        <button
          class="rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
          :disabled="index === englishBlocks.length - 1"
          title="Di chuyển xuống"
          @click="moveBlock(index, 'down')"
        >
          <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
          </svg>
        </button>
      </div>

      <div class="flex items-center justify-between rounded-t-xl border-b border-slate-100 bg-slate-50 px-4 py-2">
        <span class="text-xs font-medium uppercase tracking-wide text-slate-500">
          {{ getBlockLabel(block.type) }}
        </span>
        <div class="flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
          <button
            class="rounded p-1 text-slate-400 hover:bg-slate-200 hover:text-slate-600"
            title="Nhân bản"
            @click="duplicateBlock(index)"
          >
            <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
          </button>
          <button
            class="rounded p-1 text-slate-400 hover:bg-red-100 hover:text-red-600"
            title="Xóa"
            @click="removeBlock(index)"
          >
            <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </div>

      <div class="space-y-4 p-4">
        <template v-if="block.type === 'heading'">
          <div class="mb-3 flex items-center gap-3">
            <select
              :value="block.data.level || 2"
              class="input-field w-24 py-2 text-sm"
              @change="updateHeadingLevel(index, Number(($event.target as HTMLSelectElement).value))"
            >
              <option :value="1">H1</option>
              <option :value="2">H2</option>
              <option :value="3">H3</option>
            </select>
            <p class="text-sm text-slate-500">Nhập tiêu đề cho cả tiếng Việt và tiếng Anh</p>
          </div>

          <div class="grid gap-4 md:grid-cols-2">
            <div>
              <label class="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">Tiếng Việt</label>
              <input
                :value="getViBlock(index).data.text || ''"
                type="text"
                class="input-field"
                placeholder="Nhập tiêu đề tiếng Việt..."
                @input="updateBlockText(index, 'vi', ($event.target as HTMLInputElement).value)"
              />
            </div>
            <div>
              <label class="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">English</label>
              <input
                :value="block.data.text || ''"
                type="text"
                class="input-field"
                placeholder="Enter English heading..."
                @input="updateBlockText(index, 'en', ($event.target as HTMLInputElement).value)"
              />
            </div>
          </div>
        </template>

        <template v-else-if="block.type === 'paragraph'">
          <div class="grid gap-4 md:grid-cols-2">
            <div>
              <div class="mb-1 flex items-center justify-between">
                <label class="block text-xs font-semibold uppercase tracking-wide text-slate-500">Đoạn tiếng Việt</label>
                <div class="flex items-center gap-1">
                  <button
                    type="button"
                    class="h-7 w-7 rounded border border-slate-300 text-sm font-bold text-slate-700 transition hover:bg-slate-100"
                    title="Chữ đậm — bọc phần bôi đen bằng **"
                    @click="toggleInlineFormat(index, 'vi', '**')"
                  >
                    B
                  </button>
                  <button
                    type="button"
                    class="h-7 w-7 rounded border border-slate-300 text-sm italic text-slate-700 transition hover:bg-slate-100"
                    title="Chữ nghiêng — bọc phần bôi đen bằng *"
                    @click="toggleInlineFormat(index, 'vi', '*')"
                  >
                    I
                  </button>
                </div>
              </div>
              <textarea
                :ref="(el) => (paragraphRefs[`${block.id}-vi`] = el as HTMLTextAreaElement | null)"
                :value="getViBlock(index).data.text || ''"
                rows="6"
                class="input-field resize-y"
                placeholder="Nhập nội dung tiếng Việt..."
                @input="updateBlockText(index, 'vi', ($event.target as HTMLTextAreaElement).value)"
              />
            </div>
            <div>
              <div class="mb-1 flex items-center justify-between">
                <label class="block text-xs font-semibold uppercase tracking-wide text-slate-500">Paragraph (English)</label>
                <div class="flex items-center gap-1">
                  <button
                    type="button"
                    class="h-7 w-7 rounded border border-slate-300 text-sm font-bold text-slate-700 transition hover:bg-slate-100"
                    title="Bold — wraps selection in **"
                    @click="toggleInlineFormat(index, 'en', '**')"
                  >
                    B
                  </button>
                  <button
                    type="button"
                    class="h-7 w-7 rounded border border-slate-300 text-sm italic text-slate-700 transition hover:bg-slate-100"
                    title="Italic — wraps selection in *"
                    @click="toggleInlineFormat(index, 'en', '*')"
                  >
                    I
                  </button>
                </div>
              </div>
              <textarea
                :ref="(el) => (paragraphRefs[`${block.id}-en`] = el as HTMLTextAreaElement | null)"
                :value="block.data.text || ''"
                rows="6"
                class="input-field resize-y"
                placeholder="Enter English paragraph..."
                @input="updateBlockText(index, 'en', ($event.target as HTMLTextAreaElement).value)"
              />
            </div>
          </div>
          <p class="mt-1 text-[11px] text-slate-400">
            Bôi đen chữ rồi bấm <strong>B</strong> hoặc <em>I</em>. Đánh dấu lưu dạng
            <code>**đậm**</code> và <code>*nghiêng*</code>.
          </p>
        </template>

        <template v-else-if="block.type === 'table'">
          <div class="mb-3 flex flex-wrap items-center gap-2">
            <button type="button" class="rounded border border-slate-300 px-3 py-1 text-xs font-medium transition hover:bg-slate-100" @click="addTableRow(index)">
              + Thêm hàng
            </button>
            <button type="button" class="rounded border border-slate-300 px-3 py-1 text-xs font-medium transition hover:bg-slate-100" @click="addTableColumn(index)">
              + Thêm cột
            </button>
            <label class="ml-1 flex items-center gap-1.5 text-xs text-slate-600">
              <input
                type="checkbox"
                :checked="normalizeTableData(block.data).hasHeader"
                @change="toggleTableHeader(index)"
              />
              Có hàng tiêu đề
            </label>
          </div>

          <div v-for="language in (['vi', 'en'] as const)" :key="language" class="mb-4">
            <label class="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">
              {{ language === 'vi' ? 'Bảng tiếng Việt' : 'Table (English)' }}
            </label>
            <div class="overflow-x-auto rounded-lg border border-slate-200">
              <table class="w-full border-collapse text-sm">
                <thead v-if="normalizeTableData(language === 'vi' ? getViBlock(index).data : block.data).hasHeader">
                  <tr class="bg-slate-50">
                    <th
                      v-for="(cell, col) in normalizeTableData(language === 'vi' ? getViBlock(index).data : block.data).headers"
                      :key="`h-${col}`"
                      class="border border-slate-200 p-1"
                    >
                      <div class="flex items-center gap-1">
                        <input
                          :value="cell"
                          class="w-full min-w-24 rounded border-0 bg-transparent px-1 py-1 text-xs font-semibold focus:bg-white focus:ring-1 focus:ring-red-400"
                          :placeholder="`Cột ${col + 1}`"
                          @input="updateTableCell(index, language, -1, col, ($event.target as HTMLInputElement).value)"
                        />
                        <button
                          v-if="language === 'en'"
                          type="button"
                          class="shrink-0 text-xs text-slate-400 transition hover:text-red-600"
                          title="Xoá cột này"
                          @click="removeTableColumn(index, col)"
                        >
                          ✕
                        </button>
                      </div>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr
                    v-for="(row, rowIndex) in normalizeTableData(language === 'vi' ? getViBlock(index).data : block.data).rows"
                    :key="`r-${rowIndex}`"
                  >
                    <td v-for="(cell, col) in row" :key="`c-${rowIndex}-${col}`" class="border border-slate-200 p-1">
                      <div class="flex items-center gap-1">
                        <input
                          :value="cell"
                          class="w-full min-w-24 rounded border-0 bg-transparent px-1 py-1 text-xs focus:bg-white focus:ring-1 focus:ring-red-400"
                          @input="updateTableCell(index, language, rowIndex, col, ($event.target as HTMLInputElement).value)"
                        />
                        <button
                          v-if="language === 'en' && col === row.length - 1"
                          type="button"
                          class="shrink-0 text-xs text-slate-400 transition hover:text-red-600"
                          title="Xoá hàng này"
                          @click="removeTableRow(index, rowIndex)"
                        >
                          ✕
                        </button>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
          <p class="text-[11px] text-slate-400">
            Thêm/xoá hàng và cột áp dụng cho cả hai ngôn ngữ để bảng không lệch khung.
          </p>
        </template>

        <template v-else-if="block.type === 'image'">
          <input
            :ref="(el) => (imageInputRefs[String(block.id)] = el as HTMLInputElement | null)"
            type="file"
            accept="image/*"
            class="hidden"
            @change="handleImageUpload($event, index)"
          />

          <div v-if="!block.data.url" class="rounded-lg border-2 border-dashed border-slate-300 p-6 text-center">
            <button class="btn-secondary" @click="imageInputRefs[String(block.id)]?.click()">
              📷 Tải ảnh lên
            </button>
            <p class="mt-2 text-xs text-slate-400">Hoặc dán URL ảnh</p>
            <input
              type="url"
              class="input-field mt-2 text-sm"
              placeholder="https://res.cloudinary.com/..."
              @blur="handleImageUrlInput($event, index)"
            />
          </div>

          <div v-else class="space-y-4">
            <div class="relative inline-block">
              <img :src="block.data.url" alt="" class="max-h-72 rounded-lg" />
              <div class="absolute right-2 top-2 flex gap-1">
                <button
                  class="rounded-lg bg-white/90 p-1.5 shadow hover:bg-white"
                  title="Thay ảnh"
                  @click="imageInputRefs[String(block.id)]?.click()"
                >
                  🔄
                </button>
                <button
                  class="rounded-lg bg-white/90 p-1.5 shadow hover:bg-red-100"
                  title="Xóa ảnh"
                  @click="clearImage(index)"
                >
                  ✕
                </button>
              </div>
            </div>

            <div class="grid gap-4 md:grid-cols-2">
              <div>
                <label class="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">Caption tiếng Việt</label>
                <input
                  :value="getViBlock(index).data.caption || ''"
                  type="text"
                  class="input-field text-sm"
                  placeholder="Chú thích tiếng Việt"
                  @input="updateImageMeta(index, 'caption', 'vi', ($event.target as HTMLInputElement).value)"
                />
              </div>
              <div>
                <label class="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">Caption English</label>
                <input
                  :value="block.data.caption || ''"
                  type="text"
                  class="input-field text-sm"
                  placeholder="English caption"
                  @input="updateImageMeta(index, 'caption', 'en', ($event.target as HTMLInputElement).value)"
                />
              </div>
            </div>

            <div class="grid gap-4 md:grid-cols-2">
              <div>
                <label class="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">Alt tiếng Việt</label>
                <input
                  :value="getViBlock(index).data.alt || ''"
                  type="text"
                  class="input-field text-sm"
                  placeholder="Alt tiếng Việt"
                  @input="updateImageMeta(index, 'alt', 'vi', ($event.target as HTMLInputElement).value)"
                />
              </div>
              <div>
                <label class="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">Alt English</label>
                <input
                  :value="block.data.alt || ''"
                  type="text"
                  class="input-field text-sm"
                  placeholder="English alt text"
                  @input="updateImageMeta(index, 'alt', 'en', ($event.target as HTMLInputElement).value)"
                />
              </div>
            </div>
          </div>
        </template>

        <template v-else-if="block.type === 'quote'">
          <div class="space-y-4 rounded-lg border-l-4 border-red-500 bg-slate-50 p-4">
            <div class="grid gap-4 md:grid-cols-2">
              <div>
                <label class="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">Quote tiếng Việt</label>
                <textarea
                  :value="getViBlock(index).data.text || ''"
                  rows="4"
                  class="input-field resize-y italic"
                  placeholder="Nội dung trích dẫn tiếng Việt..."
                  @input="updateQuoteText(index, 'vi', ($event.target as HTMLTextAreaElement).value)"
                />
              </div>
              <div>
                <label class="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">Quote English</label>
                <textarea
                  :value="block.data.text || ''"
                  rows="4"
                  class="input-field resize-y italic"
                  placeholder="English quote..."
                  @input="updateQuoteText(index, 'en', ($event.target as HTMLTextAreaElement).value)"
                />
              </div>
            </div>

            <div>
              <label class="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">Tác giả / Author</label>
              <input
                :value="block.data.author || ''"
                type="text"
                class="input-field text-sm"
                placeholder="— Tác giả hoặc nguồn"
                @input="updateQuoteAuthor(index, ($event.target as HTMLInputElement).value)"
              />
            </div>
          </div>
        </template>

        <template v-else-if="block.type === 'bulletList'">
          <div class="space-y-3">
            <div
              v-for="itemIndex in getMaxListLength(index)"
              :key="`${block.id}-${itemIndex}`"
              class="grid gap-3 md:grid-cols-[1fr_1fr_auto]"
            >
              <input
                :value="getViListItem(index, itemIndex - 1)"
                type="text"
                class="input-field"
                placeholder="Mục tiếng Việt..."
                @input="updateListItem(index, itemIndex - 1, 'vi', ($event.target as HTMLInputElement).value)"
              />
              <input
                :value="getEnListItem(index, itemIndex - 1)"
                type="text"
                class="input-field"
                placeholder="English item..."
                @input="updateListItem(index, itemIndex - 1, 'en', ($event.target as HTMLInputElement).value)"
              />
              <button
                class="rounded px-2 py-2 text-slate-400 hover:bg-red-100 hover:text-red-600"
                title="Xóa dòng"
                @click="removeListItem(index, itemIndex - 1)"
              >
                ✕
              </button>
            </div>

            <button class="text-sm font-medium text-red-600 hover:underline" @click="addListItem(index)">
              + Thêm mục
            </button>
          </div>
        </template>

        <template v-else-if="block.type === 'divider'">
          <div class="flex items-center justify-center py-2">
            <hr class="flex-1 border-slate-300" />
            <span class="px-3 text-xs text-slate-400">PHÂN CÁCH</span>
            <hr class="flex-1 border-slate-300" />
          </div>
        </template>

        <template v-else-if="block.type === 'cta'">
          <div class="space-y-4 rounded-lg bg-red-50 p-4">
            <div class="grid gap-4 md:grid-cols-2">
              <div>
                <label class="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">Loại CTA</label>
                <select
                  :value="block.data.type || 'booking'"
                  class="input-field text-sm"
                  @change="updateCtaShared(index, 'type', ($event.target as HTMLSelectElement).value)"
                >
                  <option value="booking">Đặt bay</option>
                  <option value="tour">Đặt tour</option>
                  <option value="contact">Liên hệ</option>
                </select>
              </div>
              <div>
                <label class="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">Link</label>
                <input
                  :value="block.data.link || ''"
                  type="text"
                  class="input-field text-sm"
                  placeholder="/booking"
                  @input="updateCtaShared(index, 'link', ($event.target as HTMLInputElement).value)"
                />
              </div>
            </div>

            <div class="grid gap-4 md:grid-cols-2">
              <div>
                <label class="mb-1 flex items-center gap-1 text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Text tiếng Việt
                  <span v-if="!getViBlock(index).data.text" class="text-red-500">*</span>
                </label>
                <input
                  :value="getViBlock(index).data.text || ''"
                  type="text"
                  :class="['input-field text-sm', !getViBlock(index).data.text ? 'border-red-400' : '']"
                  placeholder="Đặt bay ngay (bắt buộc)"
                  @input="updateCtaText(index, 'vi', ($event.target as HTMLInputElement).value)"
                />
              </div>
              <div>
                <label class="mb-1 flex items-center gap-1 text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Text English
                  <span v-if="!block.data.text" class="text-red-500">*</span>
                </label>
                <input
                  :value="block.data.text || ''"
                  type="text"
                  :class="['input-field text-sm', !block.data.text ? 'border-red-400' : '']"
                  placeholder="Book now (required)"
                  @input="updateCtaText(index, 'en', ($event.target as HTMLInputElement).value)"
                />
              </div>
            </div>
          </div>
        </template>

        <template v-else-if="block.type === 'video'">
          <div class="space-y-4 rounded-lg bg-slate-50 p-4">
            <div>
              <label class="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">
                Link YouTube / Vimeo
              </label>
              <input
                :value="block.data.url || ''"
                type="text"
                class="input-field text-sm"
                placeholder="https://www.youtube.com/watch?v=..."
                @input="updateVideoUrl(index, ($event.target as HTMLInputElement).value)"
              />
              <p v-if="block.data.url && !getVideoEmbedUrl(block.data.url)" class="mt-1 text-xs text-red-500">
                Link không hợp lệ — chỉ hỗ trợ YouTube và Vimeo
              </p>
            </div>
            <div v-if="block.data.url && getVideoEmbedUrl(block.data.url)" class="aspect-video overflow-hidden rounded-lg bg-black">
              <iframe
                :src="getVideoEmbedUrl(block.data.url)!"
                class="h-full w-full"
                frameborder="0"
                allowfullscreen
              />
            </div>
            <div>
              <label class="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">Chú thích (tuỳ chọn)</label>
              <input
                :value="block.data.caption || ''"
                type="text"
                class="input-field text-sm"
                placeholder="Mô tả ngắn về video..."
                @input="updateVideoCaption(index, ($event.target as HTMLInputElement).value)"
              />
            </div>
          </div>
        </template>

        <template v-else-if="block.type === 'linkCard'">
          <div class="space-y-4 rounded-lg bg-blue-50 p-4">
            <div>
              <label class="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">URL</label>
              <input
                :value="block.data.url || ''"
                type="text"
                class="input-field text-sm"
                placeholder="https://..."
                @input="updateLinkCardUrl(index, ($event.target as HTMLInputElement).value)"
              />
            </div>
            <div class="grid gap-4 md:grid-cols-2">
              <div>
                <label class="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">Tiêu đề tiếng Việt</label>
                <input
                  :value="getViBlock(index).data.title || ''"
                  type="text"
                  class="input-field text-sm"
                  placeholder="Tiêu đề link (tuỳ chọn)"
                  @input="updateLinkCardText(index, 'vi', 'title', ($event.target as HTMLInputElement).value)"
                />
              </div>
              <div>
                <label class="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">Title (English)</label>
                <input
                  :value="block.data.title || ''"
                  type="text"
                  class="input-field text-sm"
                  placeholder="Link title (optional)"
                  @input="updateLinkCardText(index, 'en', 'title', ($event.target as HTMLInputElement).value)"
                />
              </div>
            </div>
            <div class="grid gap-4 md:grid-cols-2">
              <div>
                <label class="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">Mô tả tiếng Việt</label>
                <input
                  :value="getViBlock(index).data.description || ''"
                  type="text"
                  class="input-field text-sm"
                  placeholder="Mô tả ngắn (tuỳ chọn)"
                  @input="updateLinkCardText(index, 'vi', 'description', ($event.target as HTMLInputElement).value)"
                />
              </div>
              <div>
                <label class="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">Description (English)</label>
                <input
                  :value="block.data.description || ''"
                  type="text"
                  class="input-field text-sm"
                  placeholder="Short description (optional)"
                  @input="updateLinkCardText(index, 'en', 'description', ($event.target as HTMLInputElement).value)"
                />
              </div>
            </div>
          </div>
        </template>
      </div>

      <div class="absolute -bottom-4 left-1/2 z-10 -translate-x-1/2 opacity-0 transition-opacity group-hover:opacity-100">
        <button
          class="rounded-full border border-slate-300 bg-white p-1.5 shadow-sm hover:border-red-400 hover:bg-slate-50"
          @click="showAddMenu(index)"
        >
          <svg class="h-4 w-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
          </svg>
        </button>
      </div>
    </div>

    <button
      class="w-full rounded-xl border-2 border-dashed border-slate-300 py-3 text-slate-500 transition-colors hover:border-red-400 hover:text-red-600"
      @click="showAddMenu(englishBlocks.length - 1)"
    >
      + Thêm block mới
    </button>

    <Teleport to="body">
      <Transition
        enter-active-class="transition ease-out duration-100"
        enter-from-class="opacity-0 scale-95"
        enter-to-class="opacity-100 scale-100"
        leave-active-class="transition ease-in duration-75"
        leave-from-class="opacity-100 scale-100"
        leave-to-class="opacity-0 scale-95"
      >
        <div
          v-if="addMenuVisible"
          class="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4"
          @click.self="addMenuVisible = false"
        >
          <div class="w-full max-w-sm rounded-xl bg-white p-4 shadow-xl">
            <h4 class="mb-3 font-semibold text-slate-900">Thêm block</h4>
            <div class="grid grid-cols-2 gap-2">
              <button
                v-for="blockType in blockTypes"
                :key="blockType.type"
                class="flex items-center gap-2 rounded-lg border border-slate-200 p-3 text-left transition-colors hover:border-red-300 hover:bg-slate-50"
                @click="addBlock(blockType.type)"
              >
                <span class="text-lg">{{ blockType.icon }}</span>
                <span class="text-sm font-medium">{{ blockType.label }}</span>
              </button>
            </div>
            <button class="mt-4 w-full py-2 text-sm text-slate-500 hover:text-slate-700" @click="addMenuVisible = false">
              Hủy
            </button>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, reactive, ref, watchEffect } from 'vue'
import { normalizeTableData, usePostsAdminStore } from '~/stores/postsAdmin'
import { useCloudinaryUpload } from '~/composables/useCloudinaryUpload'

type BlockType = 'heading' | 'paragraph' | 'image' | 'quote' | 'bulletList' | 'divider' | 'cta' | 'video' | 'linkCard' | 'table'

type BlockData = {
  level?: number
  text?: string
  headers?: string[]
  rows?: string[][]
  hasHeader?: boolean
  url?: string
  caption?: string
  alt?: string
  author?: string
  items?: string[]
  type?: string
  link?: string
  title?: string
  description?: string
}

type ContentBlock = {
  id: string
  type: BlockType
  data: BlockData
}

type DraftModel = {
  contentBlocks: ContentBlock[]
  contentBlocksVi: ContentBlock[]
}

const store = usePostsAdminStore()
const draft = store.draft as unknown as DraftModel
const { uploadImage } = useCloudinaryUpload()

const addMenuVisible = ref(false)
const addMenuAfterIndex = ref(-1)
const imageInputRefs = reactive<Record<string, HTMLInputElement | null>>({})

const blockTypes = [
  { type: 'heading', label: 'Tiêu đề', icon: 'H' },
  { type: 'paragraph', label: 'Đoạn văn', icon: '¶' },
  { type: 'image', label: 'Hình ảnh', icon: '🖼️' },
  { type: 'quote', label: 'Trích dẫn', icon: '❝' },
  { type: 'bulletList', label: 'Danh sách', icon: '•' },
  { type: 'divider', label: 'Phân cách', icon: '─' },
  { type: 'cta', label: 'Nút CTA', icon: '🎫' },
  { type: 'video', label: 'Video YouTube', icon: '▶' },
  { type: 'linkCard', label: 'Link Card', icon: '🔗' },
  { type: 'table', label: 'Bảng', icon: '▦' }
] as const satisfies ReadonlyArray<{ type: BlockType; label: string; icon: string }>

const englishBlocks = computed<ContentBlock[]>(() => {
  return Array.isArray(draft.contentBlocks) ? draft.contentBlocks : []
})

function createId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
}

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T
}

function createEmptyBlock(type: BlockType): ContentBlock {
  const id = createId()

  switch (type) {
    case 'heading':
      return { id, type, data: { level: 2, text: '' } }
    case 'paragraph':
      return { id, type, data: { text: '' } }
    case 'image':
      return { id, type, data: { url: '', caption: '', alt: '' } }
    case 'quote':
      return { id, type, data: { text: '', author: '' } }
    case 'bulletList':
      return { id, type, data: { items: [''] } }
    case 'divider':
      return { id, type, data: {} }
    case 'cta':
      return { id, type, data: { type: 'booking', link: '', text: '' } }
    case 'video':
      return { id, type, data: { url: '', caption: '' } }
    case 'linkCard':
      return { id, type, data: { url: '', title: '', description: '' } }
    case 'table':
      return { id, type, data: { headers: ['', ''], rows: [['', ''], ['', '']], hasHeader: true } }
  }
}

function createVietnameseVersion(block: ContentBlock): ContentBlock {
  const viBlock = clone(block)
  viBlock.data = viBlock.data || {}

  switch (viBlock.type) {
    case 'heading':
    case 'paragraph':
      viBlock.data.text = viBlock.data.text || ''
      break
    case 'image':
      viBlock.data.url = viBlock.data.url || ''
      viBlock.data.caption = viBlock.data.caption || ''
      viBlock.data.alt = viBlock.data.alt || ''
      break
    case 'quote':
      viBlock.data.text = viBlock.data.text || ''
      viBlock.data.author = viBlock.data.author || ''
      break
    case 'bulletList':
      viBlock.data.items = Array.isArray(viBlock.data.items) ? viBlock.data.items : ['']
      break
    case 'cta':
      viBlock.data.text = viBlock.data.text || ''
      viBlock.data.type = viBlock.data.type || 'booking'
      viBlock.data.link = viBlock.data.link || ''
      break
    case 'divider':
      break
    case 'video':
      viBlock.data.url = viBlock.data.url || ''
      viBlock.data.caption = viBlock.data.caption || ''
      break
    case 'linkCard':
      viBlock.data.url = viBlock.data.url || ''
      viBlock.data.title = viBlock.data.title || ''
      viBlock.data.description = viBlock.data.description || ''
      break
    case 'table':
      viBlock.data = normalizeTableData(viBlock.data)
      break
  }

  return viBlock
}

function applySharedFields(enBlock: ContentBlock, viBlock: ContentBlock): ContentBlock {
  const next = clone(viBlock)
  next.id = enBlock.id
  next.type = enBlock.type
  next.data = next.data || {}

  switch (enBlock.type) {
    case 'heading':
      next.data.level = enBlock.data.level || 2
      break
    case 'image':
      next.data.url = enBlock.data.url || ''
      break
    case 'quote':
      next.data.author = enBlock.data.author || ''
      break
    case 'bulletList': {
      const enItems = Array.isArray(enBlock.data.items) ? enBlock.data.items : []
      const viItems = Array.isArray(next.data.items) ? next.data.items : []
      next.data.items = enItems.map((_, index) => viItems[index] || '')
      break
    }
    case 'cta':
      next.data.type = enBlock.data.type || 'booking'
      next.data.link = enBlock.data.link || ''
      break
    case 'video':
      next.data.url = enBlock.data.url || ''
      next.data.caption = enBlock.data.caption || ''
      break
    case 'linkCard':
      next.data.url = enBlock.data.url || ''
      break
    case 'table': {
      // Khung bảng theo bản tiếng Anh, chữ trong ô giữ của bản tiếng Việt.
      const enTable = normalizeTableData(enBlock.data)
      const viTable = normalizeTableData(next.data)

      next.data = {
        hasHeader: enTable.hasHeader,
        headers: enTable.headers.map((_, i) => viTable.headers[i] ?? ''),
        rows: enTable.rows.map((row, r) => row.map((_, c) => viTable.rows[r]?.[c] ?? ''))
      }
      break
    }
    case 'paragraph':
    case 'divider':
      break
  }

  return next
}

function ensureBilingualBlocks() {
  draft.contentBlocks = Array.isArray(draft.contentBlocks) ? draft.contentBlocks : []
  draft.contentBlocksVi = Array.isArray(draft.contentBlocksVi) ? draft.contentBlocksVi : []

  if (!draft.contentBlocksVi.length && draft.contentBlocks.length) {
    draft.contentBlocksVi = draft.contentBlocks.map(createVietnameseVersion)
    return
  }

  const viMap = new Map<string, ContentBlock>(draft.contentBlocksVi.map((block) => [block.id, block]))

  draft.contentBlocksVi = draft.contentBlocks.map((block) => {
    const existing = viMap.get(block.id)
    if (!existing || existing.type !== block.type) {
      return createVietnameseVersion(block)
    }
    return applySharedFields(block, existing)
  })
}

watchEffect(() => {
  ensureBilingualBlocks()
})

function getBlockLabel(type: BlockType): string {
  return blockTypes.find((item) => item.type === type)?.label || type
}

function getEnglishBlock(index: number): ContentBlock | undefined {
  return draft.contentBlocks[index]
}

function getViBlock(index: number): ContentBlock {
  const current = getEnglishBlock(index)

  if (!current) {
    return createEmptyBlock('paragraph')
  }

  if (!draft.contentBlocksVi[index]) {
    draft.contentBlocksVi[index] = createVietnameseVersion(current)
  }

  return draft.contentBlocksVi[index]!
}

function showAddMenu(afterIndex: number) {
  addMenuAfterIndex.value = afterIndex
  addMenuVisible.value = true
}

function addBlock(type: BlockType) {
  const englishBlock = createEmptyBlock(type)
  const vietnameseBlock = createVietnameseVersion(englishBlock)
  const insertIndex = addMenuAfterIndex.value + 1

  draft.contentBlocks.splice(insertIndex, 0, englishBlock)
  draft.contentBlocksVi.splice(insertIndex, 0, vietnameseBlock)
  addMenuVisible.value = false
}

function duplicateBlock(index: number) {
  const english = getEnglishBlock(index)
  if (!english) return

  const vietnamese = getViBlock(index)
  const englishClone = clone(english)
  const vietnameseClone = clone(vietnamese)
  const newId = createId()

  englishClone.id = newId
  vietnameseClone.id = newId

  draft.contentBlocks.splice(index + 1, 0, englishClone)
  draft.contentBlocksVi.splice(index + 1, 0, vietnameseClone)
}

function removeBlock(index: number) {
  if (index < 0 || index >= draft.contentBlocks.length) return
  draft.contentBlocks.splice(index, 1)
  draft.contentBlocksVi.splice(index, 1)
}

function moveBlock(index: number, direction: 'up' | 'down') {
  const targetIndex = direction === 'up' ? index - 1 : index + 1
  if (targetIndex < 0 || targetIndex >= draft.contentBlocks.length) return

  const [english] = draft.contentBlocks.splice(index, 1)
  const [vietnamese] = draft.contentBlocksVi.splice(index, 1)

  if (!english || !vietnamese) return

  draft.contentBlocks.splice(targetIndex, 0, english)
  draft.contentBlocksVi.splice(targetIndex, 0, vietnamese)
}

function updateHeadingLevel(index: number, level: number) {
  const block = getEnglishBlock(index)
  if (!block) return

  block.data.level = level
  getViBlock(index).data.level = level
}

// ---------------------------------------------------------------------------
// Chữ đậm / in nghiêng cho đoạn văn
// ---------------------------------------------------------------------------

const paragraphRefs = reactive<Record<string, HTMLTextAreaElement | null>>({})

/**
 * Bọc phần chữ đang bôi đen bằng dấu ** (đậm) hoặc * (nghiêng).
 * Nếu bấm khi đang bọc sẵn thì gỡ dấu ra, để nút hoạt động như công tắc.
 */
function toggleInlineFormat(index: number, language: 'vi' | 'en', marker: '**' | '*') {
  const block = language === 'vi' ? getViBlock(index) : getEnglishBlock(index)
  if (!block) return

  const key = `${block.id}-${language}`
  const el = paragraphRefs[key]
  const text = String(block.data.text ?? '')

  // Không bôi đen thì chèn cặp dấu rỗng rồi đặt con trỏ vào giữa
  const start = el?.selectionStart ?? text.length
  const end = el?.selectionEnd ?? text.length

  const before = text.slice(0, start)
  const selected = text.slice(start, end)
  const after = text.slice(end)

  const alreadyWrapped =
    selected.length > 0 &&
    selected.startsWith(marker) &&
    selected.endsWith(marker) &&
    selected.length >= marker.length * 2

  const nextSelected = alreadyWrapped
    ? selected.slice(marker.length, -marker.length)
    : `${marker}${selected}${marker}`

  updateBlockText(index, language, `${before}${nextSelected}${after}`)

  // Trả lại vùng bôi đen quanh đúng phần chữ vừa xử lý
  nextTick(() => {
    const node = paragraphRefs[key]
    if (!node) return

    const offset = alreadyWrapped ? -marker.length : marker.length
    node.focus()
    node.setSelectionRange(start + Math.max(offset, 0), start + offset + selected.length)
  })
}

// ---------------------------------------------------------------------------
// Bảng
// ---------------------------------------------------------------------------

/** Đọc dữ liệu bảng đã chuẩn hoá của một khối, theo ngôn ngữ. */
function tableOf(index: number, language: 'vi' | 'en') {
  const block = language === 'vi' ? getViBlock(index) : getEnglishBlock(index)
  return normalizeTableData(block?.data)
}

/** Ghi dữ liệu bảng cho cả hai ngôn ngữ, giữ số hàng/cột khớp nhau. */
function writeTable(index: number, language: 'vi' | 'en', next: ReturnType<typeof normalizeTableData>) {
  const target = language === 'vi' ? getViBlock(index) : getEnglishBlock(index)
  if (!target) return
  target.data = next
}

function updateTableCell(index: number, language: 'vi' | 'en', row: number, col: number, value: string) {
  const table = tableOf(index, language)

  if (row < 0) {
    table.headers[col] = value
  } else if (table.rows[row]) {
    table.rows[row]![col] = value
  }

  writeTable(index, language, table)
}

/** Thêm/bớt hàng, cột phải áp cho CẢ hai ngôn ngữ để bảng không lệch khung. */
function addTableRow(index: number) {
  for (const language of ['en', 'vi'] as const) {
    const table = tableOf(index, language)
    table.rows.push(Array.from({ length: table.headers.length }, () => ''))
    writeTable(index, language, table)
  }
}

function removeTableRow(index: number, row: number) {
  for (const language of ['en', 'vi'] as const) {
    const table = tableOf(index, language)
    if (table.rows.length <= 1) continue
    table.rows.splice(row, 1)
    writeTable(index, language, table)
  }
}

function addTableColumn(index: number) {
  for (const language of ['en', 'vi'] as const) {
    const table = tableOf(index, language)
    table.headers.push('')
    table.rows.forEach((row) => row.push(''))
    writeTable(index, language, table)
  }
}

function removeTableColumn(index: number, col: number) {
  for (const language of ['en', 'vi'] as const) {
    const table = tableOf(index, language)
    if (table.headers.length <= 1) continue
    table.headers.splice(col, 1)
    table.rows.forEach((row) => row.splice(col, 1))
    writeTable(index, language, table)
  }
}

function toggleTableHeader(index: number) {
  const next = !tableOf(index, 'en').hasHeader

  for (const language of ['en', 'vi'] as const) {
    const table = tableOf(index, language)
    table.hasHeader = next
    writeTable(index, language, table)
  }
}

function updateBlockText(index: number, language: 'vi' | 'en', value: string) {
  const englishBlock = getEnglishBlock(index)
  if (!englishBlock) return

  if (language === 'vi') {
    getViBlock(index).data.text = value
  } else {
    englishBlock.data.text = value
  }
}

function updateQuoteText(index: number, language: 'vi' | 'en', value: string) {
  const englishBlock = getEnglishBlock(index)
  if (!englishBlock) return

  if (language === 'vi') {
    getViBlock(index).data.text = value
  } else {
    englishBlock.data.text = value
  }
}

function updateQuoteAuthor(index: number, value: string) {
  const englishBlock = getEnglishBlock(index)
  if (!englishBlock) return

  englishBlock.data.author = value
  getViBlock(index).data.author = value
}

function updateImageMeta(index: number, field: 'caption' | 'alt', language: 'vi' | 'en', value: string) {
  const englishBlock = getEnglishBlock(index)
  if (!englishBlock) return

  if (language === 'vi') {
    getViBlock(index).data[field] = value
  } else {
    englishBlock.data[field] = value
  }
}

function clearImage(index: number) {
  const englishBlock = getEnglishBlock(index)
  if (!englishBlock) return

  englishBlock.data.url = ''
  englishBlock.data.caption = ''
  englishBlock.data.alt = ''

  const viBlock = getViBlock(index)
  viBlock.data.url = ''
  viBlock.data.caption = ''
  viBlock.data.alt = ''
}

function getEnItems(index: number): string[] {
  const block = getEnglishBlock(index)
  const items = block?.data.items
  return Array.isArray(items) ? items : []
}

function getViItems(index: number): string[] {
  const items = getViBlock(index).data.items
  return Array.isArray(items) ? items : []
}

function getMaxListLength(index: number): number {
  return Math.max(getEnItems(index).length, getViItems(index).length, 1)
}

function getEnListItem(index: number, itemIndex: number): string {
  return getEnItems(index)[itemIndex] || ''
}

function getViListItem(index: number, itemIndex: number): string {
  return getViItems(index)[itemIndex] || ''
}

function addListItem(index: number) {
  const englishBlock = getEnglishBlock(index)
  if (!englishBlock) return

  const enItems = [...getEnItems(index)]
  const viItems = [...getViItems(index)]

  enItems.push('')
  viItems.push('')

  englishBlock.data.items = enItems
  getViBlock(index).data.items = viItems
}

function removeListItem(index: number, itemIndex: number) {
  const englishBlock = getEnglishBlock(index)
  if (!englishBlock) return

  const enItems = [...getEnItems(index)]
  const viItems = [...getViItems(index)]

  enItems.splice(itemIndex, 1)
  viItems.splice(itemIndex, 1)

  englishBlock.data.items = enItems.length ? enItems : ['']
  getViBlock(index).data.items = viItems.length ? viItems : ['']
}

function updateListItem(index: number, itemIndex: number, language: 'vi' | 'en', value: string) {
  const englishBlock = getEnglishBlock(index)
  if (!englishBlock) return

  if (language === 'vi') {
    const viItems = [...getViItems(index)]
    while (viItems.length <= itemIndex) viItems.push('')
    viItems[itemIndex] = value
    getViBlock(index).data.items = viItems
  } else {
    const enItems = [...getEnItems(index)]
    while (enItems.length <= itemIndex) enItems.push('')
    enItems[itemIndex] = value
    englishBlock.data.items = enItems
    ensureBilingualBlocks()
  }
}

function updateCtaShared(index: number, field: 'type' | 'link', value: string) {
  const englishBlock = getEnglishBlock(index)
  if (!englishBlock) return

  englishBlock.data[field] = value
  getViBlock(index).data[field] = value
}

function updateCtaText(index: number, language: 'vi' | 'en', value: string) {
  const englishBlock = getEnglishBlock(index)
  if (!englishBlock) return

  if (language === 'vi') {
    getViBlock(index).data.text = value
  } else {
    englishBlock.data.text = value
  }
}

function getVideoEmbedUrl(url: string): string | null {
  if (!url) return null
  const yt = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/shorts\/)([^&\n?#]+)/)
  if (yt) return `https://www.youtube.com/embed/${yt[1]}?rel=0`
  const vimeo = url.match(/vimeo\.com\/(\d+)/)
  if (vimeo) return `https://player.vimeo.com/video/${vimeo[1]}`
  return null
}

function updateVideoUrl(index: number, value: string) {
  const englishBlock = getEnglishBlock(index)
  if (!englishBlock) return
  englishBlock.data.url = value
  getViBlock(index).data.url = value
}

function updateVideoCaption(index: number, value: string) {
  const englishBlock = getEnglishBlock(index)
  if (!englishBlock) return
  englishBlock.data.caption = value
  getViBlock(index).data.caption = value
}

function updateLinkCardUrl(index: number, value: string) {
  const englishBlock = getEnglishBlock(index)
  if (!englishBlock) return
  englishBlock.data.url = value
  getViBlock(index).data.url = value
}

function updateLinkCardText(index: number, language: 'vi' | 'en', field: 'title' | 'description', value: string) {
  const englishBlock = getEnglishBlock(index)
  if (!englishBlock) return
  if (language === 'vi') {
    getViBlock(index).data[field] = value
  } else {
    englishBlock.data[field] = value
  }
}

async function handleImageUpload(event: Event, index: number) {
  const file = (event.target as HTMLInputElement).files?.[0]
  if (!file) return

  const englishBlock = getEnglishBlock(index)
  if (!englishBlock) return

  try {
    const result = await uploadImage(file, { folder: 'posts/content' })
    englishBlock.data.url = result.url
    getViBlock(index).data.url = result.url
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Lỗi tải ảnh'
    alert(message)
  } finally {
    const target = event.target as HTMLInputElement
    target.value = ''
  }
}

function handleImageUrlInput(event: Event, index: number) {
  const url = (event.target as HTMLInputElement).value
  if (!url || !url.startsWith('http')) return

  const englishBlock = getEnglishBlock(index)
  if (!englishBlock) return

  englishBlock.data.url = url
  getViBlock(index).data.url = url
  ;(event.target as HTMLInputElement).value = ''
}
</script>