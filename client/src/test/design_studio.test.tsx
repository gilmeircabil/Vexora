import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router';
import { DESIGN_PRESETS, DESIGN_CATEGORIES } from '../lib/designStudio/presets.js';
import { AVAILABLE_FONTS } from '../lib/designStudio/fontLoader.js';
import { TopToolbar } from '../features/design-studio/TopToolbar.js';

describe('Design Studio Client Architecture', () => {
  describe('Presets and Categories Configuration', () => {
    it('should include all required categories', () => {
      const categoryIds = DESIGN_CATEGORIES.map((c) => c.id);
      expect(categoryIds).toContain('all');
      expect(categoryIds).toContain('social-media');
      expect(categoryIds).toContain('youtube');
      expect(categoryIds).toContain('presentations');
      expect(categoryIds).toContain('marketing');
      expect(categoryIds).toContain('business');
      expect(categoryIds).toContain('events');
      expect(categoryIds).toContain('custom');
    });

    it('should provide popular social media and print presets with correct dimensions', () => {
      const igPost = DESIGN_PRESETS.find((p) => p.id === 'instagram-post');
      expect(igPost).toBeDefined();
      expect(igPost?.width).toBe(1080);
      expect(igPost?.height).toBe(1080);
      expect(igPost?.aspectRatio).toBe('1:1');

      const ytThumb = DESIGN_PRESETS.find((p) => p.id === 'youtube-thumbnail');
      expect(ytThumb).toBeDefined();
      expect(ytThumb?.width).toBe(1280);
      expect(ytThumb?.height).toBe(720);

      const story = DESIGN_PRESETS.find((p) => p.id === 'instagram-story');
      expect(story).toBeDefined();
      expect(story?.width).toBe(1080);
      expect(story?.height).toBe(1920);

      const slide = DESIGN_PRESETS.find((p) => p.id === 'presentation-slide');
      expect(slide).toBeDefined();
      expect(slide?.width).toBe(1920);
      expect(slide?.height).toBe(1080);
    });
  });

  describe('Font Loader Catalog', () => {
    it('should offer key typography font families', () => {
      const families = AVAILABLE_FONTS.map((f) => f.family);
      expect(families).toContain('Inter');
      expect(families).toContain('Montserrat');
      expect(families).toContain('Roboto');
      expect(families).toContain('Playfair Display');
      expect(families).toContain('Oswald');
      expect(families).toContain('Lobster');
      expect(families).toContain('Courier Prime');
    });
  });

  describe('TopToolbar Component', () => {
    it('should render project title, save status, and trigger callbacks on interaction', () => {
      const onTitleChange = vi.fn();
      const onManualSave = vi.fn();
      const onUndo = vi.fn();
      const onRedo = vi.fn();
      const onZoomIn = vi.fn();
      const onZoomOut = vi.fn();
      const onZoomReset = vi.fn();
      const onOpenPreview = vi.fn();
      const onOpenExport = vi.fn();
      const onOpenVersions = vi.fn();
      const onOpenAITools = vi.fn();

      render(
        <BrowserRouter>
          <TopToolbar
            title="My Test Banner"
            onTitleChange={onTitleChange}
            saveStatus="saved"
            lastSavedAt={new Date('2026-10-30T10:00:00Z')}
            onManualSave={onManualSave}
            canUndo={true}
            canRedo={false}
            onUndo={onUndo}
            onRedo={onRedo}
            zoom={1}
            onZoomIn={onZoomIn}
            onZoomOut={onZoomOut}
            onZoomReset={onZoomReset}
            onOpenPreview={onOpenPreview}
            onOpenExport={onOpenExport}
            onOpenVersions={onOpenVersions}
            onOpenAITools={onOpenAITools}
            currentVersion={3}
          />
        </BrowserRouter>,
      );

      // Verify title input
      const titleInput = screen.getByPlaceholderText('Untitled Design') as HTMLInputElement;
      expect(titleInput.value).toBe('My Test Banner');

      // Change title
      fireEvent.change(titleInput, { target: { value: 'Renamed Banner' } });
      fireEvent.blur(titleInput);
      expect(onTitleChange).toHaveBeenCalledWith('Renamed Banner');

      // Export button click
      const exportBtn = screen.getByText('Export');
      fireEvent.click(exportBtn);
      expect(onOpenExport).toHaveBeenCalled();

      // AI Magic button click
      const aiBtn = screen.getByTitle('Enhance image with AI (Free & Built-in)');
      fireEvent.click(aiBtn);
      expect(onOpenAITools).toHaveBeenCalled();

      // Undo button click
      const undoBtn = screen.getByTitle('Undo (Ctrl+Z)');
      fireEvent.click(undoBtn);
      expect(onUndo).toHaveBeenCalled();

      // Version badge
      expect(screen.getByText('v3')).toBeDefined();
    });
  });
});
