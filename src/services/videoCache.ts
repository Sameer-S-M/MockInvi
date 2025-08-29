export class VideoCacheService {
  private idToBlobUrl: Map<string, string> = new Map();
  private urlToId: Map<string, string> = new Map();
  private inFlight: Map<string, Promise<string | null>> = new Map();
  private concurrency = 3;
  private queue: Array<() => Promise<void>> = [];
  private active = 0;

  constructor(concurrency: number = 3) {
    this.concurrency = concurrency;
  }

  getUrl(id: string): string | null {
    return this.idToBlobUrl.get(id) || null;
  }

  async prefetch(id: string, url: string): Promise<string | null> {
    if (!url) return null;
    const existing = this.idToBlobUrl.get(id);
    if (existing) return existing;

    const inflightKey = `${id}`;
    const inflight = this.inFlight.get(inflightKey);
    if (inflight) return inflight;

    const task = () => this.fetchToBlobUrl(id, url).finally(() => {
      this.active = Math.max(0, this.active - 1);
      this.dequeue();
    });

    const promise = new Promise<string | null>((resolve) => {
      this.enqueue(async () => {
        const result = await task();
        resolve(result);
      });
    });

    this.inFlight.set(inflightKey, promise);
    return promise;
  }

  private enqueue(job: () => Promise<void>) {
    this.queue.push(job);
    this.dequeue();
  }

  private dequeue() {
    if (this.active >= this.concurrency) return;
    const job = this.queue.shift();
    if (!job) return;
    this.active += 1;
    job();
  }

  private async fetchToBlobUrl(id: string, url: string): Promise<string | null> {
    try {
      const response = await fetch(url, { cache: 'force-cache' });
      if (!response.ok) throw new Error(`Failed to fetch video: ${response.status}`);
      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);
      const prev = this.idToBlobUrl.get(id);
      if (prev) URL.revokeObjectURL(prev);
      this.idToBlobUrl.set(id, blobUrl);
      this.urlToId.set(url, id);
      return blobUrl;
    } catch (err) {
      console.warn('Video prefetch failed', { id, url, err });
      return null;
    } finally {
      this.inFlight.delete(id);
    }
  }

  revokeAll() {
    for (const [, blobUrl] of this.idToBlobUrl) {
      try { URL.revokeObjectURL(blobUrl); } catch {}
    }
    this.idToBlobUrl.clear();
    this.urlToId.clear();
    this.inFlight.clear();
    this.queue = [];
    this.active = 0;
  }
}

export const videoCache = new VideoCacheService(3);
