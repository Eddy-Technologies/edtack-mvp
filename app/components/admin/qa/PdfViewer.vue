<template>
  <div class="flex flex-col h-full">
    <!-- Toolbar -->
    <div class="flex items-center gap-2 px-3 py-2 border-b border-slate-200 bg-slate-50 flex-shrink-0">
      <span class="text-sm font-medium text-slate-700">
        Pages {{ prevPageNumber || '—' }}–{{ currentPageNumber || '—' }}
      </span>

      <div class="flex-1" />

      <!-- Zoom controls -->
      <button
        class="p-1 rounded hover:bg-slate-200"
        title="Zoom out"
        @click="zoomOut"
      >
        <UIcon name="i-lucide-zoom-out" class="w-4 h-4" />
      </button>
      <span class="text-xs text-slate-500 w-10 text-center">{{ Math.round(zoom * 100) }}%</span>
      <button
        class="p-1 rounded hover:bg-slate-200"
        title="Zoom in"
        @click="zoomIn"
      >
        <UIcon name="i-lucide-zoom-in" class="w-4 h-4" />
      </button>
      <button
        class="p-1 rounded hover:bg-slate-200"
        title="Fit width"
        @click="zoom = 1"
      >
        <UIcon name="i-lucide-maximize-2" class="w-4 h-4" />
      </button>

      <div class="w-px h-5 bg-slate-300 mx-1" />

      <!-- Crop mode -->
      <button
        :class="[
          'flex items-center gap-1 px-2 py-1 rounded text-sm transition-colors',
          cropMode
            ? 'bg-blue-100 text-blue-700'
            : 'hover:bg-slate-200 text-slate-600',
        ]"
        @click="toggleCropMode"
      >
        <UIcon name="i-lucide-crop" class="w-4 h-4" />
        Crop
      </button>

      <button
        v-if="cropRect"
        class="flex items-center gap-1 px-2 py-1 rounded text-sm bg-green-100 text-green-700 hover:bg-green-200 transition-colors"
        :disabled="uploading"
        @click="uploadCrop"
      >
        <UIcon v-if="!uploading" name="i-lucide-upload" class="w-4 h-4" />
        <div v-else class="w-4 h-4 animate-spin rounded-full border-2 border-green-700 border-t-transparent" />
        Upload
      </button>
    </div>

    <!-- Image container -->
    <div
      ref="containerRef"
      class="flex-1 overflow-auto bg-slate-100"
      @wheel.prevent="onWheel"
      @mousemove="onMouseMove"
      @mouseup="onMouseUp"
    >
      <div
        class="inline-block"
        :style="{ transform: `scale(${zoom})`, transformOrigin: 'top left' }"
      >
        <!-- Previous page -->
        <div v-if="prevPageNumber">
          <div class="sticky top-0 z-10 bg-slate-600 text-white text-xs px-2 py-0.5 font-medium">
            Page {{ prevPageNumber }}
          </div>
          <div class="relative">
            <img
              ref="prevImgRef"
              :src="`/api/admin/qa/pages/${prevPageNumber}`"
              class="block max-w-none"
              :class="{ 'cursor-crosshair': cropMode }"
              draggable="false"
              @mousedown="(e: MouseEvent) => onImageMouseDown(e, 'prev')"
            >

            <!-- Active drag overlay -->
            <div
              v-if="dragging && cropPageNumber === prevPageNumber"
              class="absolute border-2 border-dashed border-blue-400 bg-blue-400/10 pointer-events-none"
              :style="dragRectStyle"
            />

            <!-- Finalized crop rect with handles -->
            <CropOverlay
              v-if="cropRect && cropPageNumber === prevPageNumber"
              :rect="cropRect"
              @adjust-start="onAdjustStart"
            />

            <!-- Existing crops (green) -->
            <div
              v-for="crop in cropsForPage(prevPageNumber)"
              :key="crop.placeholder"
              class="absolute border-2 border-green-500 bg-green-500/10 pointer-events-none"
              :style="{
                left: crop.crop_rect.x + 'px',
                top: crop.crop_rect.y + 'px',
                width: crop.crop_rect.width + 'px',
                height: crop.crop_rect.height + 'px',
              }"
            >
              <span class="absolute -top-5 left-0 text-xs bg-green-600 text-white px-1 rounded">
                {{ crop.placeholder }}
              </span>
            </div>
          </div>
        </div>

        <!-- Current page -->
        <div v-if="currentPageNumber">
          <div class="sticky top-0 z-10 bg-blue-600 text-white text-xs px-2 py-0.5 font-medium">
            Page {{ currentPageNumber }} (current)
          </div>
          <div class="relative">
            <img
              ref="currentImgRef"
              :src="`/api/admin/qa/pages/${currentPageNumber}`"
              class="block max-w-none"
              :class="{ 'cursor-crosshair': cropMode }"
              draggable="false"
              @load="onImageLoad"
              @mousedown="(e: MouseEvent) => onImageMouseDown(e, 'current')"
            >

            <!-- Active drag overlay -->
            <div
              v-if="dragging && cropPageNumber === currentPageNumber"
              class="absolute border-2 border-dashed border-blue-400 bg-blue-400/10 pointer-events-none"
              :style="dragRectStyle"
            />

            <!-- Finalized crop rect with handles -->
            <CropOverlay
              v-if="cropRect && cropPageNumber === currentPageNumber"
              :rect="cropRect"
              @adjust-start="onAdjustStart"
            />

            <!-- Existing crops (green) -->
            <div
              v-for="crop in cropsForPage(currentPageNumber)"
              :key="crop.placeholder"
              class="absolute border-2 border-green-500 bg-green-500/10 pointer-events-none"
              :style="{
                left: crop.crop_rect.x + 'px',
                top: crop.crop_rect.y + 'px',
                width: crop.crop_rect.width + 'px',
                height: crop.crop_rect.height + 'px',
              }"
            >
              <span class="absolute -top-5 left-0 text-xs bg-green-600 text-white px-1 rounded">
                {{ crop.placeholder }}
              </span>
            </div>
          </div>
        </div>

        <div v-if="!currentPageNumber" class="flex items-center justify-center h-64 text-slate-400">
          No page to display
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, defineComponent, h } from 'vue';

// Inline CropOverlay component — interactive crop rect with resize handles
const CropOverlay = defineComponent({
  props: {
    rect: { type: Object as () => { x: number; y: number; width: number; height: number }, required: true },
  },
  emits: ['adjust-start'],
  setup(props, { emit }) {
    const handle = (cursor: string, handleId: string) =>
      h('div', {
        class: `absolute bg-blue-500 ${cursor}`,
        style: handleStyles[handleId],
        onMousedown: (e: MouseEvent) => {
          e.stopPropagation();
          e.preventDefault();
          emit('adjust-start', { handle: handleId, event: e });
        },
      });

    const handleStyles: Record<string, Record<string, string>> = {
      nw: { top: '-4px', left: '-4px', width: '8px', height: '8px', cursor: 'nw-resize' },
      ne: { top: '-4px', right: '-4px', width: '8px', height: '8px', cursor: 'ne-resize' },
      sw: { bottom: '-4px', left: '-4px', width: '8px', height: '8px', cursor: 'sw-resize' },
      se: { bottom: '-4px', right: '-4px', width: '8px', height: '8px', cursor: 'se-resize' },
      n: { top: '-3px', left: '50%', transform: 'translateX(-50%)', width: '16px', height: '6px', cursor: 'n-resize' },
      s: { bottom: '-3px', left: '50%', transform: 'translateX(-50%)', width: '16px', height: '6px', cursor: 's-resize' },
      w: { top: '50%', left: '-3px', transform: 'translateY(-50%)', width: '6px', height: '16px', cursor: 'w-resize' },
      e: { top: '50%', right: '-3px', transform: 'translateY(-50%)', width: '6px', height: '16px', cursor: 'e-resize' },
    };

    return () =>
      h(
        'div',
        {
          class: 'absolute border-2 border-dashed border-blue-500 bg-blue-500/10 cursor-move',
          style: {
            left: props.rect.x + 'px',
            top: props.rect.y + 'px',
            width: props.rect.width + 'px',
            height: props.rect.height + 'px',
          },
          onMousedown: (e: MouseEvent) => {
            e.stopPropagation();
            e.preventDefault();
            emit('adjust-start', { handle: 'move', event: e });
          },
        },
        [
          handle('cursor-nw-resize', 'nw'),
          handle('cursor-ne-resize', 'ne'),
          handle('cursor-sw-resize', 'sw'),
          handle('cursor-se-resize', 'se'),
          handle('cursor-n-resize', 'n'),
          handle('cursor-s-resize', 's'),
          handle('cursor-w-resize', 'w'),
          handle('cursor-e-resize', 'e'),
        ]
      );
  },
});

const {
  currentQuestion,
  currentPageNumber,
  markDirty,
} = useQAReview();

const prevPageNumber = computed(() => {
  if (!currentPageNumber.value || currentPageNumber.value <= 9) return null;
  return currentPageNumber.value - 1;
});

const containerRef = ref<HTMLElement | null>(null);
const prevImgRef = ref<HTMLImageElement | null>(null);
const currentImgRef = ref<HTMLImageElement | null>(null);
const zoom = ref(1);
const cropMode = ref(false);
const uploading = ref(false);

// Crop drawing state
const cropRect = ref<{ x: number; y: number; width: number; height: number } | null>(null);
const cropPageNumber = ref<number | null>(null);
const dragging = ref(false);
const dragStart = ref({ x: 0, y: 0 });
const dragCurrent = ref({ x: 0, y: 0 });

// Crop adjustment state (move / resize)
const adjusting = ref(false);
const adjustHandle = ref('');
const adjustStartCoords = ref({ x: 0, y: 0 });
const adjustStartRect = ref({ x: 0, y: 0, width: 0, height: 0 });

function cropsForPage(pageNum: number | null) {
  if (!pageNum) return [];
  return currentQuestion.value?.diagram_crops?.filter(
    (c) => c.page_number === pageNum
  ) || [];
}

const activeCropImg = computed(() => {
  if (cropPageNumber.value === prevPageNumber.value) return prevImgRef.value;
  return currentImgRef.value;
});

const dragRectStyle = computed(() => {
  if (!dragging.value) return {};
  const x = Math.min(dragStart.value.x, dragCurrent.value.x);
  const y = Math.min(dragStart.value.y, dragCurrent.value.y);
  const w = Math.abs(dragCurrent.value.x - dragStart.value.x);
  const hVal = Math.abs(dragCurrent.value.y - dragStart.value.y);
  return { left: x + 'px', top: y + 'px', width: w + 'px', height: hVal + 'px' };
});

function zoomIn() {
  zoom.value = Math.min(zoom.value + 0.25, 4);
}

function zoomOut() {
  zoom.value = Math.max(zoom.value - 0.25, 0.25);
}

function onWheel(e: WheelEvent) {
  if (e.ctrlKey || e.metaKey) {
    if (e.deltaY < 0) zoomIn();
    else zoomOut();
  } else {
    if (containerRef.value) {
      containerRef.value.scrollTop += e.deltaY;
      containerRef.value.scrollLeft += e.deltaX;
    }
  }
}

function toggleCropMode() {
  cropMode.value = !cropMode.value;
  if (!cropMode.value) {
    cropRect.value = null;
    cropPageNumber.value = null;
    adjusting.value = false;
  }
}

function getImageCoords(e: MouseEvent, img: HTMLImageElement | null): { x: number; y: number } {
  if (!img) return { x: 0, y: 0 };
  const rect = img.getBoundingClientRect();
  return {
    x: (e.clientX - rect.left) / zoom.value,
    y: (e.clientY - rect.top) / zoom.value,
  };
}

// Start drawing a new crop rect on the image
function onImageMouseDown(e: MouseEvent, which: 'prev' | 'current') {
  if (!cropMode.value) return;
  e.preventDefault();
  const img = which === 'prev' ? prevImgRef.value : currentImgRef.value;
  const pageNum = which === 'prev' ? prevPageNumber.value : currentPageNumber.value;
  cropPageNumber.value = pageNum;
  const coords = getImageCoords(e, img);
  dragStart.value = coords;
  dragCurrent.value = coords;
  dragging.value = true;
  cropRect.value = null;
  adjusting.value = false;
}

// Start adjusting existing crop rect (move or resize)
function onAdjustStart(payload: { handle: string; event: MouseEvent }) {
  if (!cropRect.value) return;
  adjusting.value = true;
  adjustHandle.value = payload.handle;
  const coords = getImageCoords(payload.event, activeCropImg.value);
  adjustStartCoords.value = { x: coords.x, y: coords.y };
  adjustStartRect.value = { ...cropRect.value };
}

function onMouseMove(e: MouseEvent) {
  if (dragging.value) {
    dragCurrent.value = getImageCoords(e, activeCropImg.value);
    return;
  }

  if (adjusting.value && cropRect.value) {
    const coords = getImageCoords(e, activeCropImg.value);
    const dx = coords.x - adjustStartCoords.value.x;
    const dy = coords.y - adjustStartCoords.value.y;
    const r = adjustStartRect.value;

    if (adjustHandle.value === 'move') {
      cropRect.value = {
        x: Math.round(r.x + dx),
        y: Math.round(r.y + dy),
        width: r.width,
        height: r.height,
      };
    } else {
      let { x, y, width, height } = r;

      // Adjust edges based on handle
      if (adjustHandle.value.includes('n')) {
        y = r.y + dy;
        height = r.height - dy;
      }
      if (adjustHandle.value.includes('s')) {
        height = r.height + dy;
      }
      if (adjustHandle.value.includes('w')) {
        x = r.x + dx;
        width = r.width - dx;
      }
      if (adjustHandle.value.includes('e')) {
        width = r.width + dx;
      }

      // Enforce minimum size
      if (width < 10) {
        width = 10;
        if (adjustHandle.value.includes('w')) x = r.x + r.width - 10;
      }
      if (height < 10) {
        height = 10;
        if (adjustHandle.value.includes('n')) y = r.y + r.height - 10;
      }

      cropRect.value = {
        x: Math.round(x),
        y: Math.round(y),
        width: Math.round(width),
        height: Math.round(height),
      };
    }
  }
}

function onMouseUp(_e: MouseEvent) {
  if (dragging.value) {
    dragging.value = false;
    const x = Math.min(dragStart.value.x, dragCurrent.value.x);
    const y = Math.min(dragStart.value.y, dragCurrent.value.y);
    const w = Math.abs(dragCurrent.value.x - dragStart.value.x);
    const hVal = Math.abs(dragCurrent.value.y - dragStart.value.y);
    if (w > 10 && hVal > 10) {
      cropRect.value = { x: Math.round(x), y: Math.round(y), width: Math.round(w), height: Math.round(hVal) };
    }
    return;
  }

  if (adjusting.value) {
    adjusting.value = false;
  }
}

function onImageLoad() {
  zoom.value = 1;
}

async function uploadCrop() {
  const img = activeCropImg.value;
  if (!cropRect.value || !currentQuestion.value || !cropPageNumber.value || !img) return;

  uploading.value = true;
  try {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d')!;

    const scaleX = img.naturalWidth / img.width;
    const scaleY = img.naturalHeight / img.height;

    const sx = cropRect.value.x * scaleX;
    const sy = cropRect.value.y * scaleY;
    const sw = cropRect.value.width * scaleX;
    const sh = cropRect.value.height * scaleY;

    canvas.width = Math.round(sw);
    canvas.height = Math.round(sh);
    ctx.drawImage(img, sx, sy, sw, sh, 0, 0, canvas.width, canvas.height);

    const imageBase64 = canvas.toDataURL('image/png');

    const q = currentQuestion.value;
    const placeholderMatch = q.question.match(/&&img&&\s*([\w]+)\s*&&img&&/);
    const placeholder = placeholderMatch ?
      placeholderMatch[1] :
      `page_${cropPageNumber.value}_${q.part_label.replace(/\s/g, '')}`;

    const res = await $fetch<{
      success: boolean;
      data: { public_url: string; storage_path: string };
    }>('/api/admin/qa/images/upload', {
      method: 'POST',
      body: {
        imageBase64,
        placeholder,
        questionId: q.id,
        cropRect: cropRect.value,
        pageNumber: cropPageNumber.value,
      },
    });

    if (res.success) {
      const bustUrl = res.data.public_url + '?t=' + Date.now();
      const crop = {
        placeholder,
        storage_path: res.data.storage_path,
        public_url: bustUrl,
        crop_rect: cropRect.value,
        page_number: cropPageNumber.value!,
        created_at: new Date().toISOString(),
      };

      if (!currentQuestion.value!.diagram_crops) {
        currentQuestion.value!.diagram_crops = [];
      }

      const existingIdx = currentQuestion.value!.diagram_crops.findIndex(
        (c) => c.placeholder === placeholder
      );
      if (existingIdx >= 0) {
        currentQuestion.value!.diagram_crops[existingIdx] = crop;
      } else {
        currentQuestion.value!.diagram_crops.push(crop);
      }

      currentQuestion.value!.question_image_url = bustUrl;
      markDirty();
      cropRect.value = null;
      cropPageNumber.value = null;
      cropMode.value = false;
      adjusting.value = false;
    }
  } catch (err) {
    console.error('Upload failed:', err);
  } finally {
    uploading.value = false;
  }
}

// Reset crop when question changes
watch(currentPageNumber, () => {
  cropRect.value = null;
  cropPageNumber.value = null;
  cropMode.value = false;
  adjusting.value = false;
});
</script>
