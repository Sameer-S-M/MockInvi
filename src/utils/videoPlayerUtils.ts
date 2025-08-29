export interface VideoSource {
  type: 'youtube' | 'vimeo' | 'drive' | 'direct' | 'file';
  url: string;
  embedUrl?: string;
  thumbnailUrl?: string;
}

export const videoPlayerUtils = {
  // Identify platforms
  isYouTubeUrl(url: string): boolean {
    return /(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)/i.test(url);
  },
  isVimeoUrl(url: string): boolean {
    return /vimeo\.com\/(?:\d+)/i.test(url);
  },
  isGoogleDriveUrl(url: string): boolean {
    return /drive\.google\.com\//i.test(url);
  },
  isDirectVideoUrl(url: string): boolean {
    const exts = ['.mp4', '.webm', '.ogg', '.mov', '.avi', '.mkv'];
    const lower = url.toLowerCase();
    return exts.some(ext => lower.includes(ext));
  },

  // Converters
  convertToYouTubeEmbed(url: string): string {
    try {
      if (url.includes('watch?v=')) {
        const u = new URL(url);
        const id = u.searchParams.get('v');
        if (id) return `https://www.youtube.com/embed/${id}`;
      }
      if (url.includes('youtu.be/')) {
        const id = url.split('youtu.be/')[1]?.split(/[?&#]/)[0];
        if (id) return `https://www.youtube.com/embed/${id}`;
      }
    } catch {}
    throw new Error('Invalid YouTube URL');
  },
  convertToVimeoEmbed(url: string): string {
    try {
      const id = url.split('vimeo.com/')[1]?.split(/[?&#]/)[0];
      if (id) return `https://player.vimeo.com/video/${id}`;
    } catch {}
    throw new Error('Invalid Vimeo URL');
  },
  convertToDriveEmbed(url: string): string {
    try {
      let fileId = '';
      if (url.includes('/file/d/')) fileId = url.split('/file/d/')[1]?.split('/')[0] || '';
      else if (url.includes('id=')) fileId = new URL(url).searchParams.get('id') || '';
      else if (url.match(/\/d\/[a-zA-Z0-9_-]+/)) fileId = url.split('/d/')[1]?.split('/')[0] || '';
      if (!fileId) throw new Error('no-id');
      // Google Drive direct stream link
      return `https://drive.google.com/uc?export=download&id=${fileId}`;
    } catch {}
    throw new Error('Invalid Google Drive URL');
  },

  // Thumbnails (best-effort)
  getYouTubeThumbnail(url: string): string | undefined {
    try {
      const embed = this.convertToYouTubeEmbed(url);
      const id = embed.split('/embed/')[1];
      return `https://img.youtube.com/vi/${id}/hqdefault.jpg`;
    } catch {
      return undefined;
    }
  },
  getVimeoThumbnail(): string | undefined {
    // Requires API; return placeholder
    return undefined;
  },
  getDriveThumbnail(): string | undefined {
    // No stable public thumbnail
    return undefined;
  },

  // Parse to source
  parseVideoUrl(url: string): VideoSource {
    if (this.isYouTubeUrl(url)) {
      return { type: 'youtube', url, embedUrl: this.convertToYouTubeEmbed(url), thumbnailUrl: this.getYouTubeThumbnail(url) };
    }
    if (this.isVimeoUrl(url)) {
      return { type: 'vimeo', url, embedUrl: this.convertToVimeoEmbed(url), thumbnailUrl: this.getVimeoThumbnail() };
    }
    if (this.isGoogleDriveUrl(url)) {
      return { type: 'drive', url, embedUrl: this.convertToDriveEmbed(url), thumbnailUrl: this.getDriveThumbnail() };
    }
    if (this.isDirectVideoUrl(url)) {
      return { type: 'direct', url, embedUrl: url };
    }
    // Fallback: treat as direct; UI should still validate separately
    return { type: 'direct', url, embedUrl: url };
  },

  // Validation + display helpers
  isValidVideoUrl(url: string): boolean {
    try {
      const s = this.parseVideoUrl(url);
      return Boolean(s.embedUrl);
    } catch {
      return false;
    }
  },
  getVideoTypeDisplay(url: string): string {
    try {
      const t = this.parseVideoUrl(url).type;
      if (t === 'youtube') return 'YouTube';
      if (t === 'vimeo') return 'Vimeo';
      if (t === 'drive') return 'Google Drive';
      if (t === 'direct') return 'Direct Video';
      if (t === 'file') return 'File Upload';
      return 'Video';
    } catch {
      return 'Unknown';
    }
  }
};
