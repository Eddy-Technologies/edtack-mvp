<template>
  <div v-if="isOpen" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-6" @click="closeModal">
    <div class="bg-white rounded-lg shadow-xl max-w-md w-full" @click.stop>
      <!-- Header -->
      <div class="flex items-center justify-between p-6 border-b">
        <h2 class="text-xl font-bold text-gray-900">Recovery Codes</h2>
        <button
          class="text-gray-400 hover:text-gray-600 transition-colors"
          @click="closeModal"
        >
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <!-- Content -->
      <div class="p-6">
        <div class="mb-4 p-4 bg-amber-50 border border-amber-200 rounded-lg">
          <div class="flex items-start space-x-3">
            <svg class="w-5 h-5 text-amber-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.464 0L4.35 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
            <div>
              <h4 class="font-medium text-amber-800">Important</h4>
              <p class="text-sm text-amber-700 mt-1">
                Save these codes in a safe place. Each code can only be used once to access your account if you lose your authenticator device.
              </p>
            </div>
          </div>
        </div>

        <!-- Recovery Codes -->
        <div class="mb-6">
          <div class="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <div class="grid grid-cols-2 gap-3">
              <div v-for="code in recoveryCodes" :key="code" class="font-mono text-sm bg-white px-3 py-2 rounded border text-center">
                {{ code }}
              </div>
            </div>
          </div>
        </div>

        <!-- Actions -->
        <div class="space-y-3">
          <button
            class="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2"
            @click="downloadCodes"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <span>Download Codes</span>
          </button>

          <button
            class="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center space-x-2"
            @click="printCodes"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
            </svg>
            <span>Print Codes</span>
          </button>

          <button
            class="w-full px-4 py-2 text-red-600 border border-red-300 rounded-lg hover:bg-red-50 transition-colors"
            @click="regenerateCodes"
          >
            Generate New Codes
          </button>
        </div>

        <!-- Close Button -->
        <div class="mt-6 pt-4 border-t">
          <button
            class="w-full px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            @click="closeModal"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';

interface Props {
  isOpen: boolean;
}

defineProps<Props>();

const emit = defineEmits<{
  (e: 'close'): void;
}>();

const recoveryCodes = ref([
  'abc123def',
  'ghi456jkl',
  'mno789pqr',
  'stu012vwx',
  'yz345abc6',
  'def789ghi',
  'jkl012mno',
  'pqr345stu'
]);

const closeModal = () => {
  emit('close');
};

const downloadCodes = () => {
  const codesText = recoveryCodes.value.join('\n');
  const blob = new Blob([`EdTack Recovery Codes\n\nSave these codes in a safe place. Each code can only be used once.\n\n${codesText}`], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'edtack-recovery-codes.txt';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

const printCodes = () => {
  const printWindow = window.open('', '_blank');
  if (printWindow) {
    printWindow.document.write(`
      <html>
        <head>
          <title>EdTack Recovery Codes</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; }
            h1 { color: #333; }
            .codes { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin: 20px 0; }
            .code { font-family: monospace; background: #f5f5f5; padding: 10px; border: 1px solid #ddd; text-align: center; }
            .warning { background: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; margin: 20px 0; }
          </style>
        </head>
        <body>
          <h1>EdTack Recovery Codes</h1>
          <div class="warning">
            <strong>Important:</strong> Save these codes in a safe place. Each code can only be used once to access your account if you lose your authenticator device.
          </div>
          <div class="codes">
            ${recoveryCodes.value.map(code => `<div class="code">${code}</div>`).join('')}
          </div>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  }
};

const regenerateCodes = () => {
  if (confirm('Are you sure you want to generate new recovery codes? This will invalidate all existing codes.')) {
    // Generate new codes
    const newCodes = [];
    for (let i = 0; i < 8; i++) {
      newCodes.push(Math.random().toString(36).substring(2, 11));
    }
    recoveryCodes.value = newCodes;
  }
};
</script>