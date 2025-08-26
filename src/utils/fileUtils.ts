/**
 * Utility functions for file operations (export/import)
 */

export interface FileDownloadOptions {
  filename: string;
  content: string;
  mimeType?: string;
}

/**
 * Download a file with the given content
 */
export const downloadFile = ({ filename, content, mimeType = 'application/json' }: FileDownloadOptions): void => {
  try {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.style.display = 'none';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    // Clean up the URL object
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Download failed:', error);
    throw new Error('Impossibile scaricare il file');
  }
};

/**
 * Read a file as text
 */
export const readFileAsText = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (event) => {
      if (event.target?.result) {
        resolve(event.target.result as string);
      } else {
        reject(new Error('Impossibile leggere il file'));
      }
    };
    
    reader.onerror = () => {
      reject(new Error('Errore durante la lettura del file'));
    };
    
    reader.readAsText(file);
  });
};

/**
 * Validate file type and size
 */
export const validateSaveFile = (file: File): { valid: boolean; error?: string } => {
  // Check file size (max 10MB)
  const maxSize = 10 * 1024 * 1024; // 10MB
  if (file.size > maxSize) {
    return { valid: false, error: 'File troppo grande (massimo 10MB)' };
  }
  
  // Check file extension
  const validExtensions = ['.json', '.sav', '.txt'];
  const fileExtension = file.name.toLowerCase().substring(file.name.lastIndexOf('.'));
  
  if (!validExtensions.includes(fileExtension)) {
    return { valid: false, error: 'Tipo di file non supportato (usa .json, .sav, o .txt)' };
  }
  
  return { valid: true };
};

/**
 * Generate a filename for save export
 */
export const generateSaveFilename = (characterName: string, level: number, slot: string): string => {
  const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
  const sanitizedName = characterName.replace(/[^a-zA-Z0-9]/g, '_');
  const slotName = slot === 'quicksave' ? 'QuickSave' : 
                   slot === 'autosave' ? 'AutoSave' : 
                   `Slot${slot.replace('slot', '')}`;
  
  return `TheSafePlace_${sanitizedName}_Lv${level}_${slotName}_${timestamp}.json`;
};

/**
 * Create a file input element for importing saves
 */
export const createFileInput = (onFileSelected: (file: File) => void): HTMLInputElement => {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = '.json,.sav,.txt';
  input.style.display = 'none';
  
  input.addEventListener('change', (event) => {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (file) {
      onFileSelected(file);
    }
  });
  
  return input;
};