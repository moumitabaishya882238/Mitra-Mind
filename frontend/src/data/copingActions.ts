export type MoodCategory =
    | 'Happy'
    | 'Calm'
    | 'Neutral'
    | 'Stressed'
    | 'Anxious'
    | 'Sad'
    | 'Depressed'
    | 'Angry'
    | 'Unknown';

export type ActivityAvailability = 'available' | 'under-development';

export type CopingAction = {
    id: string;
    title: string;
    category: 'Calm' | 'Grounding' | 'Reflect' | 'Connect';
    duration: string;
    summary: string;
    steps: string[];
    availability: ActivityAvailability;
    moods: MoodCategory[];
};

export const copingActions: CopingAction[] = [
    {
        id: 'breathing-box',
        title: 'Breathing Exercise',
        category: 'Calm',
        duration: '3-5 min',
        summary: 'Slow box breathing to settle your nervous system.',
        availability: 'available',
        moods: ['Stressed', 'Anxious', 'Angry', 'Neutral'],
        steps: [
            'Sit comfortably and relax your shoulders.',
            'Inhale slowly for 4 counts.',
            'Hold your breath for 4 counts.',
            'Exhale slowly for 4 counts.',
            'Pause for 4 counts and repeat 5 cycles.',
        ],
    },
    {
        id: 'breathing-478',
        title: '4-7-8 Breathing',
        category: 'Calm',
        duration: '2-4 min',
        summary: 'Use structured breathing to reduce anxiety quickly.',
        availability: 'available',
        moods: ['Anxious', 'Stressed', 'Angry', 'Neutral'],
        steps: [
            'Place your tongue on the ridge behind your upper teeth.',
            'Inhale quietly through your nose for 4 counts.',
            'Hold your breath for 7 counts.',
            'Exhale fully through your mouth for 8 counts.',
            'Repeat this for 4 rounds.',
        ],
    },
    {
        id: 'muscle-relax',
        title: 'Muscle Relaxation',
        category: 'Calm',
        duration: '8-10 min',
        summary: 'Release stress by tensing and relaxing each muscle group.',
        availability: 'available',
        moods: ['Stressed', 'Anxious', 'Angry', 'Depressed'],
        steps: [
            'Start at your feet and tense the muscles for 5 seconds.',
            'Release and notice the difference for 10 seconds.',
            'Move to calves, thighs, abdomen, hands, shoulders, and face.',
            'Breathe slowly between each muscle group.',
            'Finish with one full-body release and deep breath.',
        ],
    },
    {
        id: 'grounding-54321',
        title: '5-4-3-2-1 Grounding',
        category: 'Grounding',
        duration: '3-6 min',
        summary: 'Bring attention to your senses and return to the present.',
        availability: 'available',
        moods: ['Anxious', 'Stressed', 'Angry', 'Sad', 'Depressed'],
        steps: [
            'Name 5 things you can see around you.',
            'Name 4 things you can touch right now.',
            'Name 3 things you can hear.',
            'Name 2 things you can smell.',
            'Name 1 thing you can taste or a positive statement you can say.',
        ],
    },
    {
        id: 'name-objects',
        title: 'Color Hunt',
        category: 'Grounding',
        duration: '2-3 min',
        summary: 'Use visual scanning to break spiraling thoughts.',
        availability: 'available',
        moods: ['Anxious', 'Stressed', 'Sad', 'Depressed', 'Neutral'],
        steps: [
            'Pick one color, like blue.',
            'Find 5 objects of that color around you.',
            'Pick another color and find 5 more objects.',
            'Name each object out loud.',
            'Take one deep breath and notice how your body feels now.',
        ],
    },
    {
        id: 'temperature-reset',
        title: 'Temperature Reset',
        category: 'Grounding',
        duration: '1-2 min',
        summary: 'Use cold sensation to interrupt panic intensity.',
        availability: 'under-development',
        moods: ['Anxious', 'Stressed', 'Angry'],
        steps: [
            'Hold a cool object or splash cool water on your face.',
            'Focus on the sensation for 20 seconds.',
            'Take two deep breaths while noticing the temperature.',
            'Press your feet firmly into the floor.',
            'Say: I am safe right now and present in this moment.',
        ],
    },
    {
        id: 'journaling-freewrite',
        title: 'Journaling',
        category: 'Reflect',
        duration: '10 min',
        summary: 'Get thoughts out of your head and onto paper.',
        availability: 'under-development',
        moods: ['Sad', 'Depressed', 'Stressed', 'Angry', 'Neutral'],
        steps: [
            'Set a timer for 10 minutes.',
            'Write what you are feeling without editing.',
            'Add what triggered this feeling.',
            'Write one thing you can control right now.',
            'End with one kind sentence to yourself.',
        ],
    },
    {
        id: 'thought-reframe',
        title: 'Thought Reframe',
        category: 'Reflect',
        duration: '5-8 min',
        summary: 'Challenge negative thoughts with balanced thinking.',
        availability: 'under-development',
        moods: ['Anxious', 'Stressed', 'Depressed', 'Angry', 'Sad'],
        steps: [
            'Write the stressful thought exactly as it appears.',
            'Ask: What evidence supports this thought?',
            'Ask: What evidence does not support it?',
            'Create a balanced replacement thought.',
            'Read the new thought out loud twice.',
        ],
    },
    {
        id: 'gratitude-3',
        title: '3 Gratitudes',
        category: 'Reflect',
        duration: '2-4 min',
        summary: 'Shift attention toward small sources of safety and hope.',
        availability: 'under-development',
        moods: ['Happy', 'Calm', 'Neutral', 'Sad', 'Depressed'],
        steps: [
            'List 3 things you are grateful for right now.',
            'For each one, write why it matters to you.',
            'Pick one and take a deep breath while thinking about it.',
            'Notice one small positive shift in your mood.',
            'Save this list for later hard moments.',
        ],
    },
    {
        id: 'talk-it-out',
        title: 'Talk It Out',
        category: 'Connect',
        duration: '5-15 min',
        summary: 'Reach a trusted person with a clear support ask.',
        availability: 'under-development',
        moods: ['Sad', 'Depressed', 'Anxious', 'Stressed', 'Angry'],
        steps: [
            'Pick one trusted person to contact.',
            'Send: I am having a hard time and could use support.',
            'Share one specific feeling and one specific need.',
            'Ask for one clear action, like a call or check-in.',
            'Thank them and schedule your next check-in.',
        ],
    },
    {
        id: 'voice-note-release',
        title: 'Voice Note Release',
        category: 'Connect',
        duration: '3-5 min',
        summary: 'Speak freely to release pressure and hear yourself clearly.',
        availability: 'under-development',
        moods: ['Sad', 'Depressed', 'Angry', 'Stressed'],
        steps: [
            'Open voice notes on your phone.',
            'Record a 2-minute check-in about what you feel.',
            'Listen once with compassion, not judgment.',
            'Decide if you want to keep it private or share with someone trusted.',
            'Finish with one grounding breath.',
        ],
    },
    {
        id: 'support-script',
        title: 'Ask for Support Script',
        category: 'Connect',
        duration: '2-3 min',
        summary: 'Use a ready message when words are hard to find.',
        availability: 'under-development',
        moods: ['Anxious', 'Stressed', 'Sad', 'Depressed', 'Angry'],
        steps: [
            'Copy this script: I am feeling overwhelmed and need support.',
            'Add one line with what happened today.',
            'Add one line with what helps: listening, call, or company.',
            'Send it to one trusted person now.',
            'Set a reminder to follow up in 30 minutes.',
        ],
    },
    {
        id: 'tiny-wins-activation',
        title: 'Tiny Wins Activation',
        category: 'Reflect',
        duration: '5-7 min',
        summary: 'Pick one tiny task to rebuild momentum when energy feels low.',
        availability: 'under-development',
        moods: ['Depressed', 'Sad', 'Neutral', 'Unknown'],
        steps: [
            'Write one tiny action that takes under 5 minutes.',
            'Start it immediately for just 2 minutes.',
            'Mark it done and note how your body feels.',
            'Choose one next tiny step.',
            'End with: progress over perfection.',
        ],
    },
    {
        id: 'anger-cooldown',
        title: 'Anger Cooldown Reset',
        category: 'Calm',
        duration: '3-5 min',
        summary: 'Release heat in your body before responding to a trigger.',
        availability: 'under-development',
        moods: ['Angry', 'Stressed', 'Anxious'],
        steps: [
            'Step away from the trigger for 90 seconds.',
            'Drop shoulders and unclench jaw.',
            'Do 6 slow exhales longer than inhales.',
            'Name your need in one sentence.',
            'Respond only after your body softens.',
        ],
    },
    {
        id: 'joy-anchor',
        title: 'Joy Anchor Snapshot',
        category: 'Reflect',
        duration: '2-4 min',
        summary: 'Capture one good moment so your mind can return to it later.',
        availability: 'under-development',
        moods: ['Happy', 'Calm', 'Neutral', 'Unknown'],
        steps: [
            'Notice one small moment that feels good.',
            'Take a photo or write 3 words about it.',
            'Name why this moment matters to you.',
            'Take one deep breath while replaying it.',
            'Save it as your Joy Anchor for hard days.',
        ],
    },
];
