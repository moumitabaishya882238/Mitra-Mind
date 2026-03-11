import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

const QUEUE_KEY = 'offline-queue-v1';
const DASHBOARD_CACHE_KEY = 'offline-dashboard-cache-v1';
const OFFLINE_CHAT_STATE_PREFIX = 'offline-chat-state:';

const OFFLINE_HELPLINES = [
    { name: 'India - Tele MANAS', phone: '14416 / 1-800-891-4416', site: 'https://telemanas.mohfw.gov.in' },
    { name: 'USA & Canada - 988 Lifeline', phone: 'Call or text 988', site: 'https://988lifeline.org' },
    { name: 'UK & ROI - Samaritans', phone: '116 123', site: 'https://www.samaritans.org' },
    { name: 'Global hotline directory', phone: 'Varies by country', site: 'https://findahelpline.com' },
];

const OFFLINE_FOLLOW_UPS = [
    'What feels heaviest right now?',
    'When did this feeling start getting stronger?',
    'What is one small thing that might make this next hour easier?',
    'Would it help to break this into one tiny next step together?',
    'Do you want to try a grounding breath while we stay with this?',
];

type QueueItemType = 'chat' | 'session-mood';

type QueueItem = {
    id: string;
    type: QueueItemType;
    createdAt: string;
    payload: any;
};

type DashboardCacheEntry = {
    sessionId: string;
    updatedAt: string;
    data: any;
};

function nowIso() {
    return new Date().toISOString();
}

function toTokens(text: string) {
    return String(text || '')
        .toLowerCase()
        .replace(/[^a-z\s]/g, ' ')
        .split(/\s+/)
        .filter(Boolean);
}

function inferMoodCategory(text: string) {
    const message = String(text || '').toLowerCase();
    if (/anx|panic|worried|overthink/.test(message)) return 'Anxious';
    if (/stress|overwhelm|pressure|burnout/.test(message)) return 'Stressed';
    if (/sad|down|empty|cry|lonely/.test(message)) return 'Sad';
    if (/depress|hopeless|numb|worthless/.test(message)) return 'Depressed';
    if (/angry|mad|frustrated|irritat/.test(message)) return 'Angry';
    if (/calm|peace|okay|fine/.test(message)) return 'Calm';
    if (/happy|good|great|relief/.test(message)) return 'Happy';
    return 'Neutral';
}

function inferStressScore(text: string) {
    const message = String(text || '').toLowerCase();
    if (/panic|hopeless|worthless|can't cope/.test(message)) return 9;
    if (/anx|stress|overwhelm|burnout/.test(message)) return 7;
    if (/sad|angry|frustrated/.test(message)) return 6;
    if (/calm|okay|fine/.test(message)) return 4;
    if (/happy|great|better/.test(message)) return 3;
    return 5;
}

function detectTopics(text: string) {
    const tokens = toTokens(text);
    const has = (values: string[]) => values.some((v) => tokens.includes(v));

    const topics: string[] = [];
    if (has(['exam', 'exams', 'test', 'quiz', 'midterm', 'final'])) topics.push('exams');
    if (has(['assignment', 'project', 'deadline', 'homework'])) topics.push('assignments');
    if (has(['sleep', 'insomnia', 'night', 'awake', 'tired'])) topics.push('sleep');
    if (has(['friend', 'family', 'parents', 'partner', 'breakup'])) topics.push('relationships');
    if (has(['job', 'career', 'interview', 'internship'])) topics.push('career');

    return topics.length ? topics : ['general'];
}

async function readQueue(): Promise<QueueItem[]> {
    const raw = await AsyncStorage.getItem(QUEUE_KEY);
    if (!raw) return [];
    try {
        const parsed = JSON.parse(raw);
        return Array.isArray(parsed) ? parsed : [];
    } catch {
        return [];
    }
}

async function writeQueue(items: QueueItem[]) {
    await AsyncStorage.setItem(QUEUE_KEY, JSON.stringify(items));
}

export async function enqueueOfflineChat(payload: any) {
    const queue = await readQueue();
    queue.push({
        id: `q-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        type: 'chat',
        createdAt: nowIso(),
        payload,
    });
    await writeQueue(queue);
}

export async function enqueueOfflineSessionMood(payload: any) {
    const queue = await readQueue();
    queue.push({
        id: `q-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        type: 'session-mood',
        createdAt: nowIso(),
        payload,
    });
    await writeQueue(queue);
}

export async function getOfflineQueueCount() {
    const queue = await readQueue();
    return queue.length;
}

export async function cacheDashboardInsights(sessionId: string, data: any) {
    const raw = await AsyncStorage.getItem(DASHBOARD_CACHE_KEY);
    const all: DashboardCacheEntry[] = raw ? JSON.parse(raw) : [];
    const next = all.filter((entry) => entry.sessionId !== sessionId);
    next.push({ sessionId, data, updatedAt: nowIso() });
    await AsyncStorage.setItem(DASHBOARD_CACHE_KEY, JSON.stringify(next));
}

export async function getCachedDashboardInsights(sessionId: string) {
    const raw = await AsyncStorage.getItem(DASHBOARD_CACHE_KEY);
    if (!raw) return null;
    try {
        const entries: DashboardCacheEntry[] = JSON.parse(raw);
        return entries.find((entry) => entry.sessionId === sessionId)?.data || null;
    } catch {
        return null;
    }
}

export async function buildOfflineChatResponse(message: string, sessionId: string) {
    const stateKey = `${OFFLINE_CHAT_STATE_PREFIX}${sessionId}`;
    const raw = await AsyncStorage.getItem(stateKey);
    const index = Number(raw || 0) % OFFLINE_FOLLOW_UPS.length;
    await AsyncStorage.setItem(stateKey, String(index + 1));

    const moodCategory = inferMoodCategory(message);
    const stressScore = inferStressScore(message);
    const topics = detectTopics(message);

    const lead =
        moodCategory === 'Anxious' || moodCategory === 'Stressed'
            ? 'I hear a lot of pressure in what you shared.'
            : moodCategory === 'Sad' || moodCategory === 'Depressed'
                ? 'That sounds really heavy, and I am here with you.'
                : moodCategory === 'Angry'
                    ? 'It makes sense to feel this intensity right now.'
                    : 'Thanks for sharing that with me.';

    const topicHint = topics[0] && topics[0] !== 'general' ? ` I also hear this may involve ${topics[0]}.` : '';

    const reply = `${lead}${topicHint} ${OFFLINE_FOLLOW_UPS[index]} (Offline mode: I will sync this conversation when you are back online.)`;

    return {
        reply,
        analysis: {
            moodCategory,
            stressScore,
            distress: stressScore >= 8 ? 'high' : stressScore >= 6 ? 'moderate' : 'low',
            crisisDetected: false,
            sentimentScore: 0,
            emoji: moodCategory === 'Calm' || moodCategory === 'Happy' ? '🙂' : moodCategory === 'Neutral' ? '😐' : '😟',
        },
        copingStrategies: [
            'Take one slow breath in for 4 and out for 6.',
            'Name one small next step you can do in 5 minutes.',
            'Write one kind sentence to yourself right now.',
        ],
        helplines: OFFLINE_HELPLINES,
        offline: true,
    };
}

async function isBackendReachable(apiClient: any) {
    try {
        await apiClient.get('/', { timeout: 3000 });
        return true;
    } catch {
        return false;
    }
}

export async function syncOfflineQueue(apiClient: any) {
    const online = await isBackendReachable(apiClient);
    if (!online) {
        const pending = await getOfflineQueueCount();
        return { online: false, synced: 0, pending };
    }

    const queue = await readQueue();
    if (!queue.length) {
        return { online: true, synced: 0, pending: 0 };
    }

    const remaining: QueueItem[] = [];
    let synced = 0;

    for (const item of queue) {
        try {
            if (item.type === 'chat') {
                await apiClient.post('/api/chat', item.payload, { timeout: 15000 });
            } else if (item.type === 'session-mood') {
                await apiClient.post('/ai/log-session-mood', item.payload, { timeout: 6000 });
            }
            synced += 1;
        } catch (error) {
            if (axios.isAxiosError(error) && !error.response) {
                remaining.push(item);
                remaining.push(...queue.slice(queue.indexOf(item) + 1));
                break;
            }
            // Keep hard failures for retry; they may be temporary backend issues.
            remaining.push(item);
        }
    }

    await writeQueue(remaining);
    return { online: true, synced, pending: remaining.length };
}

let syncTimer: ReturnType<typeof setInterval> | null = null;
let syncInFlight = false;

export function startOfflineSync(apiClient: any) {
    if (syncTimer) {
        return () => stopOfflineSync();
    }

    const run = async () => {
        if (syncInFlight) return;
        syncInFlight = true;
        try {
            await syncOfflineQueue(apiClient);
        } finally {
            syncInFlight = false;
        }
    };

    run();
    syncTimer = setInterval(run, 15000);

    return () => stopOfflineSync();
}

export function stopOfflineSync() {
    if (syncTimer) {
        clearInterval(syncTimer);
        syncTimer = null;
    }
}
