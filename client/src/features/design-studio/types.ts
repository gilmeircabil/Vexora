import type { Canvas, FabricObject } from 'fabric';
import type { DesignProjectDTO } from '../../lib/designStudio/api.js';

export type SaveStatus = 'saved' | 'saving' | 'unsaved' | 'error';

export interface EditorState {
  project: DesignProjectDTO | null;
  canvas: Canvas | null;
  selectedObject: FabricObject | null;
  selectedObjects: FabricObject[];
  zoom: number;
  saveStatus: SaveStatus;
  lastSavedAt: Date | null;
  canUndo: boolean;
  canRedo: boolean;
  isVersionHistoryOpen: boolean;
  isExportModalOpen: boolean;
  isPreviewModalOpen: boolean;
  isAIToolsModalOpen: boolean;
  activeSidebarTab: 'templates' | 'elements' | 'text' | 'uploads' | 'backgrounds' | 'layers';
}
