import { useEffect, useState, useRef, useCallback } from 'react';

/**
 * Custom hook to manage the loading and buffering of a large image sequence.
 * Optimized to prevent re-renders on every single frame load.
 * 
 * @param frameCount Total number of frames (e.g., 240)
 * @param folderPath Path to the folder containing images (e.g., '/Hero-Image-Sequence')
 * @returns { getFrame, loadProgress, prioritizeFrame }
 */
export const useImageSequence = (frameCount: number, folderPath: string) => {
    // Store images in a ref to avoid re-renders on every load
    const imagesRef = useRef<Map<number, HTMLImageElement>>(new Map());

    // Only state that triggers render is progress (throttled)
    const [loadProgress, setLoadProgress] = useState(0);

    // Queue management
    const loadQueue = useRef<number[]>([]);
    const loadingRef = useRef(false);
    const mountedRef = useRef(true);

    // Helper to format filename: 1 -> "001"
    const getFileName = (index: number) => {
        const paddedIndex = String(index).padStart(3, '0');
        return `ezgif-frame-${paddedIndex}.webp`;
    };

    useEffect(() => {
        mountedRef.current = true;

        // Initial strategy: Load first 10 frames ASAP (for immediate "Red Container"), then sparse, then fill
        const priorityQueue: number[] = [];

        // 1. Immediate Start (Frames 1-10)
        for (let i = 1; i <= 10; i++) priorityQueue.push(i);

        // 2. Sparse (Every 10th frame) for rough seeking
        for (let i = 11; i <= frameCount; i += 10) priorityQueue.push(i);

        // 3. The Rest
        for (let i = 1; i <= frameCount; i++) {
            if (!priorityQueue.includes(i)) priorityQueue.push(i);
        }

        loadQueue.current = priorityQueue;
        processQueue();

        return () => {
            mountedRef.current = false;
            loadQueue.current = [];
        };
    }, [frameCount, folderPath]);

    const processQueue = async () => {
        if (loadingRef.current || loadQueue.current.length === 0 || !mountedRef.current) return;
        loadingRef.current = true;

        // Process a small batch
        const BATCH_SIZE = 4;
        const batch = loadQueue.current.splice(0, BATCH_SIZE);

        await Promise.all(batch.map(index => loadFrame(index)));

        // Update progress state - calculating based on ref size vs frameCount
        if (mountedRef.current) {
            setLoadProgress(imagesRef.current.size / frameCount);
        }

        loadingRef.current = false;

        // Schedule next batch
        if (loadQueue.current.length > 0 && mountedRef.current) {
            if ('requestIdleCallback' in window) {
                (window as any).requestIdleCallback(() => processQueue(), { timeout: 100 });
            } else {
                setTimeout(processQueue, 16);
            }
        }
    };

    const loadFrame = (index: number): Promise<void> => {
        return new Promise((resolve) => {
            if (imagesRef.current.has(index)) {
                resolve();
                return;
            }

            const img = new Image();
            img.src = `${folderPath}/${getFileName(index)}`;

            let isResolved = false;

            const safeResolve = () => {
                if (!isResolved) {
                    isResolved = true;
                    resolve();
                }
            };

            // Safety Dropout: If image takes > 2s, skip it so we don't block the queue
            const timeoutId = setTimeout(() => {
                if (!isResolved) {
                    console.warn(`[useImageSequence] Timeout loading frame ${index} (${img.src})`);
                    safeResolve();
                }
            }, 2000);

            img.onload = () => {
                if (!mountedRef.current) return;
                clearTimeout(timeoutId);
                imagesRef.current.set(index, img);
                // console.log(`[useImageSequence] Loaded frame ${index}`);
                safeResolve();
            };

            img.onerror = () => {
                clearTimeout(timeoutId);
                console.warn(`[useImageSequence] Failed to load frame: ${index}`, img.src);
                safeResolve(); // Resolve anyway to unblock queue
            };
        });
    };

    // Stable getter function for animation loops
    const getFrame = useCallback((index: number) => {
        const targetIndex = Math.max(1, Math.min(Math.ceil(index), frameCount));

        // Exact match
        if (imagesRef.current.has(targetIndex)) {
            return imagesRef.current.get(targetIndex);
        }

        // Fallback: Find closest loaded frame backwards (hold previous frame)
        let fallback = targetIndex;
        while (fallback > 0) {
            if (imagesRef.current.has(fallback)) return imagesRef.current.get(fallback);
            fallback--;
        }
        return null;
    }, [frameCount]); // Dependencies are stable

    const prioritizeFrame = useCallback((index: number) => {
        if (imagesRef.current.has(index)) return;

        // Move to front of queue if present
        const qIdx = loadQueue.current.indexOf(index);
        if (qIdx > -1) {
            loadQueue.current.splice(qIdx, 1);
            loadQueue.current.unshift(index);
            // If idle, kickstart
            if (!loadingRef.current) processQueue();
        }
    }, []);

    return {
        getFrame,
        loadProgress,
        prioritizeFrame
    };
};
