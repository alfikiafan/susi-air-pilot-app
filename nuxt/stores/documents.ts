import { defineStore } from 'pinia';
import type { DocumentsResponse, PilotDocument } from '~/types/api';
import { type AppError, toAppError } from '~/utils/api-error';

export const useDocumentsStore = defineStore('documents', () => {
  const documents = ref<PilotDocument[]>([]);
  const loaded = ref(false);
  const loading = ref(false);
  const error = ref<AppError | null>(null);

  async function load({ force = false } = {}) {
    if (loaded.value && !force) return;
    loading.value = true;
    error.value = null;
    try {
      const response = await useApi()<DocumentsResponse>('/documents');
      documents.value = response.documents;
      loaded.value = true;
    } catch (e) {
      error.value = toAppError(e);
    } finally {
      loading.value = false;
    }
  }

  function $reset() {
    documents.value = [];
    loaded.value = false;
    loading.value = false;
    error.value = null;
  }

  return { documents, loaded, loading, error, load, $reset };
});
