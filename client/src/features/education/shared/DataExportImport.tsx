import React, { useState } from 'react';
import {
  Download,
  Upload,
  Trash2,
  ShieldCheck,
  AlertTriangle,
  FileCheck,
  Database,
} from 'lucide-react';
import { educationApi } from '../../../services/educationApi.js';
import { useToast } from '../../../context/ToastContext.js';

export const DataExportImport: React.FC = () => {
  const { showToast } = useToast();
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [importStatus, setImportStatus] = useState<string | null>(null);

  const handleExport = async () => {
    try {
      setIsExporting(true);
      const res = await educationApi.exportUserData();
      if (res.success && res.data) {
        const jsonStr = JSON.stringify(res.data, null, 2);
        const blob = new Blob([jsonStr], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `vexoramods-education-backup-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        setTimeout(() => URL.revokeObjectURL(url), 1000);
      } else {
        showToast(res.error || 'Failed to export data.', 'error');
      }
    } catch (e) {
      console.error('Export failed', e);
      showToast('An error occurred during data export.', 'error');
    } finally {
      setIsExporting(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (evt) => {
      try {
        setIsImporting(true);
        setImportStatus(null);
        const content = evt.target?.result as string;
        const parsed = JSON.parse(content);

        const res = await educationApi.importUserData(parsed);
        if (res.success) {
          setImportStatus(res.message || 'Import successful.');
        } else {
          setImportStatus('Error: ' + (res.error || 'Invalid file format.'));
        }
      } catch (err: any) {
        setImportStatus('Failed to parse JSON file.');
      } finally {
        setIsImporting(false);
      }
    };
    reader.readAsText(file);
  };

  const handlePurge = async () => {
    const confirmation = prompt(
      'WARNING: This will permanently delete ALL your study tasks, decks, notes, goals, timetable, and classes.\n\nType "DELETE ALL" to confirm:',
    );
    if (confirmation === 'DELETE ALL') {
      const res = await educationApi.purgeUserData();
      if (res.success) {
        showToast('All educational records have been permanently cleared.', 'success');
        window.location.reload();
      }
    }
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      {/* Header */}
      <div className="bg-[var(--theme-surface)] p-5 rounded-2xl border border-[var(--theme-gray-border)] shadow-sm">
        <h2 className="text-xl font-black flex items-center gap-2 text-[var(--theme-dirty-white)]">
          <ShieldCheck className="w-5 h-5 text-[var(--theme-dirty-white)]" />
          Data Ownership, Backup & Export
        </h2>
        <p className="text-xs text-[var(--theme-gray-muted)] mt-0.5">
          You own 100% of your educational data. Export full JSON archives, restore backups, or
          permanently purge records.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Export Card */}
        <div className="bg-[var(--theme-surface)] p-6 rounded-2xl border border-[var(--theme-gray-border)] shadow-sm flex flex-col justify-between space-y-4">
          <div>
            <div className="w-10 h-10 rounded-xl bg-[var(--theme-surface-raised)] border border-[var(--theme-gray-border)] flex items-center justify-center mb-3">
              <Download className="w-5 h-5 text-[var(--theme-dirty-white)]" />
            </div>
            <h3 className="font-bold text-base text-[var(--theme-dirty-white)]">Export Full Backup</h3>
            <p className="text-xs text-[var(--theme-gray-muted)] mt-1">
              Download your entire study history, flashcards, notes, timetable, classes, and rubric
              configurations in open standard JSON format.
            </p>
          </div>

          <button
            onClick={handleExport}
            disabled={isExporting}
            className="w-full py-2.5 px-4 bg-[var(--theme-dirty-white)] disabled:opacity-50 text-[var(--theme-canvas)] hover:bg-[var(--theme-dirty-white-muted)] font-bold text-xs rounded-xl border border-[var(--theme-gray-border)] shadow-xs transition-all cursor-pointer flex items-center justify-center gap-2"
          >
            <Download className="w-4 h-4" />
            {isExporting ? 'Generating Archive...' : 'Download JSON Archive'}
          </button>
        </div>

        {/* Import Card */}
        <div className="bg-[var(--theme-surface)] p-6 rounded-2xl border border-[var(--theme-gray-border)] shadow-sm flex flex-col justify-between space-y-4">
          <div>
            <div className="w-10 h-10 rounded-xl bg-[var(--theme-surface-raised)] border border-[var(--theme-gray-border)] flex items-center justify-center mb-3">
              <Upload className="w-5 h-5 text-[var(--theme-dirty-white)]" />
            </div>
            <h3 className="font-bold text-base text-[var(--theme-dirty-white)]">Restore from Backup</h3>
            <p className="text-xs text-[var(--theme-gray-muted)] mt-1">
              Select a previously exported VexoraMods JSON backup file to import your study tasks,
              decks, notes, and milestones.
            </p>
          </div>

          <div>
            <label className="w-full py-2.5 px-4 bg-[var(--theme-surface-raised)] text-[var(--theme-dirty-white)] hover:bg-[var(--theme-surface)] font-bold text-xs rounded-xl border border-[var(--theme-gray-border)] shadow-xs transition-all cursor-pointer flex items-center justify-center gap-2">
              <Upload className="w-4 h-4" />
              {isImporting ? 'Importing Data...' : 'Choose Backup File'}
              <input
                type="file"
                accept=".json"
                onChange={handleFileChange}
                disabled={isImporting}
                className="hidden"
              />
            </label>
            {importStatus && (
              <p className="text-[11px] font-bold text-center mt-2 text-[var(--theme-dirty-white)]">
                {importStatus}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Danger Zone: Account Data Purge */}
      <div className="p-6 bg-[var(--theme-surface)] rounded-2xl border border-red-500/40 shadow-xs space-y-3">
        <div className="flex items-center gap-2 text-red-400 font-bold text-sm">
          <AlertTriangle className="w-5 h-5 text-red-400" />
          <span>Permanently Purge Educational Data</span>
        </div>
        <p className="text-xs text-[var(--theme-gray-muted)]">
          In compliance with user privacy rights and data minimization, you can permanently erase
          all your educational materials, decks, and records from the database.
        </p>
        <button
          onClick={handlePurge}
          className="px-4 py-2 bg-red-600/90 hover:bg-red-600 text-white font-bold text-xs rounded-xl border border-red-500 shadow-xs flex items-center gap-1.5 transition-all cursor-pointer"
        >
          <Trash2 className="w-3.5 h-3.5" />
          Permanently Purge My Data
        </button>
      </div>
    </div>
  );
};
