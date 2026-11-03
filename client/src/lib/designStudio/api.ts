export interface DesignProjectDTO {
  _id: string;
  userId: string;
  title: string;
  description?: string;
  width: number;
  height: number;
  background: string;
  category: string;
  documentData?: Record<string, any>;
  thumbnailUrl?: string;
  currentVersion: number;
  revision: number;
  isStarred: boolean;
  isShared: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface DesignVersionDTO {
  _id: string;
  projectId: string;
  userId: string;
  versionNumber: number;
  versionName: string;
  documentData?: Record<string, any>;
  thumbnailUrl?: string;
  createdAt: string;
}

export interface DesignAssetDTO {
  _id: string;
  userId: string;
  projectId?: string;
  originalName: string;
  mimeType: string;
  size: number;
  storageKey: string;
  url: string;
  thumbnailUrl?: string;
  width?: number;
  height?: number;
  createdAt: string;
}

export interface DesignTemplateDTO {
  _id: string;
  title: string;
  description?: string;
  category: string;
  width: number;
  height: number;
  thumbnailUrl?: string;
  documentData: Record<string, any>;
  isPublic: boolean;
  createdAt: string;
}

function getAuthHeaders(): HeadersInit {
  const token = localStorage.getItem('tn_token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

export const designStudioApi = {
  // Projects
  async listProjects(params?: {
    search?: string;
    category?: string;
    starred?: boolean;
    sort?: string;
  }): Promise<DesignProjectDTO[]> {
    const query = new URLSearchParams();
    if (params?.search) query.set('search', params.search);
    if (params?.category && params.category !== 'all') query.set('category', params.category);
    if (params?.starred) query.set('starred', 'true');
    if (params?.sort) query.set('sort', params.sort);

    const res = await fetch(`/api/designs?${query.toString()}`, {
      headers: getAuthHeaders(),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to list projects');
    return data.projects || [];
  },

  async getProject(projectId: string): Promise<DesignProjectDTO> {
    const res = await fetch(`/api/designs/${projectId}`, {
      headers: getAuthHeaders(),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to load project');
    return data.project;
  },

  async createProject(params: {
    title: string;
    width: number;
    height: number;
    background?: string;
    category?: string;
    documentData?: Record<string, any>;
  }): Promise<DesignProjectDTO> {
    const res = await fetch('/api/designs', {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(params),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to create project');
    return data.project;
  },

  async updateProject(
    projectId: string,
    updates: Partial<DesignProjectDTO> & { revision?: number },
  ): Promise<DesignProjectDTO> {
    const res = await fetch(`/api/designs/${projectId}`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify(updates),
    });
    const data = await res.json();
    if (!res.ok) {
      if (res.status === 409) {
        throw new Error('Conflict: Project was modified in another session.');
      }
      throw new Error(data.error || 'Failed to save project');
    }
    return data.project;
  },

  async deleteProject(projectId: string): Promise<void> {
    const res = await fetch(`/api/designs/${projectId}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to delete project');
  },

  async duplicateProject(projectId: string): Promise<DesignProjectDTO> {
    const res = await fetch(`/api/designs/${projectId}/duplicate`, {
      method: 'POST',
      headers: getAuthHeaders(),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to duplicate project');
    return data.project;
  },

  async saveThumbnail(projectId: string, thumbnailUrl: string): Promise<string> {
    const res = await fetch(`/api/designs/${projectId}/thumbnail`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ thumbnailUrl }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to save thumbnail');
    return data.thumbnailUrl;
  },

  // Versions
  async listVersions(
    projectId: string,
  ): Promise<{ versions: DesignVersionDTO[]; currentVersion: number }> {
    const res = await fetch(`/api/designs/${projectId}/versions`, {
      headers: getAuthHeaders(),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to list versions');
    return {
      versions: data.versions || [],
      currentVersion: data.currentVersion || 1,
    };
  },

  async createSnapshot(
    projectId: string,
    params: { versionName: string; documentData?: Record<string, any>; thumbnailUrl?: string },
  ): Promise<DesignVersionDTO> {
    const res = await fetch(`/api/designs/${projectId}/versions`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(params),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to create version snapshot');
    return data.version;
  },

  async getVersion(projectId: string, versionId: string): Promise<DesignVersionDTO> {
    const res = await fetch(`/api/designs/${projectId}/versions/${versionId}`, {
      headers: getAuthHeaders(),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to fetch version');
    return data.version;
  },

  async restoreVersion(
    projectId: string,
    versionId: string,
  ): Promise<{ restoredVersion: DesignVersionDTO; project: DesignProjectDTO }> {
    const res = await fetch(`/api/designs/${projectId}/versions/${versionId}/restore`, {
      method: 'POST',
      headers: getAuthHeaders(),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to restore version');
    return {
      restoredVersion: data.restoredVersion,
      project: data.project,
    };
  },

  // Assets
  async uploadAsset(file: File, projectId?: string): Promise<DesignAssetDTO> {
    const token = localStorage.getItem('tn_token');
    const formData = new FormData();
    formData.append('file', file);
    if (projectId) formData.append('projectId', projectId);

    const res = await fetch('/api/design-assets/upload', {
      method: 'POST',
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: formData,
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to upload image asset');
    return data.asset;
  },

  async listAssets(projectId?: string): Promise<DesignAssetDTO[]> {
    const query = projectId ? `?projectId=${projectId}` : '';
    const res = await fetch(`/api/design-assets${query}`, {
      headers: getAuthHeaders(),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to list assets');
    return data.assets || [];
  },

  async deleteAsset(assetId: string): Promise<void> {
    const res = await fetch(`/api/design-assets/${assetId}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to delete asset');
  },

  // Templates
  async listTemplates(params?: {
    category?: string;
    search?: string;
  }): Promise<DesignTemplateDTO[]> {
    const query = new URLSearchParams();
    if (params?.category && params.category !== 'all') query.set('category', params.category);
    if (params?.search) query.set('search', params.search);

    const res = await fetch(`/api/design-templates?${query.toString()}`);
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to load templates');
    return data.templates || [];
  },

  async useTemplate(templateId: string): Promise<DesignProjectDTO> {
    const res = await fetch(`/api/design-templates/${templateId}/use`, {
      method: 'POST',
      headers: getAuthHeaders(),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to use template');
    return data.project;
  },
};
