import { useState, useEffect } from 'react';

// SM-2 Algorithm helper
const calculateSM2 = (quality, prevInterval = 0, prevEaseFactor = 2.5, prevRepetitions = 0) => {
  let interval = 1;
  let easeFactor = prevEaseFactor;
  let repetitions = prevRepetitions;

  if (quality >= 3) {
    if (repetitions === 0) {
      interval = 1; // 1 day
    } else if (repetitions === 1) {
      interval = 6; // 6 days
    } else {
      interval = Math.round(prevInterval * easeFactor);
    }
    repetitions++;
  } else {
    repetitions = 0;
    interval = 1;
  }

  // Calculate new ease factor
  easeFactor = easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));
  if (easeFactor < 1.3) easeFactor = 1.3;

  return {
    interval,
    easeFactor,
    repetitions,
    nextReview: Date.now() + interval * 24 * 60 * 60 * 1000
  };
};

export const useSRS = () => {
  const [xp, setXp] = useState(0);
  const [level, setLevel] = useState(1);
  const [streak, setStreak] = useState({ current: 0, max: 0, lastActiveDate: null });
  const [srsItems, setSrsItems] = useState({});
  const [unlockedItems, setUnlockedItems] = useState([]);
  const [kanaProgress, setKanaProgress] = useState({ hiragana: {}, katakana: {} });

  const updateStreakLogic = (currentStreak) => {
    if (!currentStreak) return;
    const today = new Date().toDateString();
    const lastActive = currentStreak.lastActiveDate;

    if (lastActive === today) {
      // Already active today, do nothing
      return;
    }

    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toDateString();

    let updatedStreak;
    if (lastActive === yesterdayStr) {
      // Active consecutive day
      const nextCurrent = (currentStreak.current || 0) + 1;
      updatedStreak = {
        current: nextCurrent,
        max: Math.max(currentStreak.max || 0, nextCurrent),
        lastActiveDate: today
      };
    } else {
      // Missed a day or more, reset streak
      updatedStreak = {
        current: 1,
        max: Math.max(currentStreak.max || 0, 1),
        lastActiveDate: today
      };
    }
    setStreak(updatedStreak);
    localStorage.setItem('nd_streak', JSON.stringify(updatedStreak));
  };

  // Load state on mount with safety guards
  useEffect(() => {
    try {
      const savedXp = localStorage.getItem('nd_xp');
      if (savedXp) setXp(parseInt(savedXp, 10) || 0);
    } catch (e) {
      console.error('Error loading XP:', e);
    }

    try {
      const savedLevel = localStorage.getItem('nd_level');
      if (savedLevel) setLevel(parseInt(savedLevel, 10) || 1);
    } catch (e) {
      console.error('Error loading Level:', e);
    }

    try {
      const savedUnlocked = localStorage.getItem('nd_unlocked');
      if (savedUnlocked) {
        const parsed = JSON.parse(savedUnlocked);
        if (Array.isArray(parsed)) setUnlockedItems(parsed);
      }
    } catch (e) {
      console.error('Error loading Unlocked Items:', e);
    }

    try {
      const savedKana = localStorage.getItem('nd_kana');
      if (savedKana) {
        const parsed = JSON.parse(savedKana);
        if (parsed && typeof parsed === 'object') setKanaProgress(parsed);
      }
    } catch (e) {
      console.error('Error loading Kana progress:', e);
    }

    try {
      const savedSrs = localStorage.getItem('nd_srs');
      if (savedSrs) {
        const parsed = JSON.parse(savedSrs);
        if (parsed && typeof parsed === 'object') setSrsItems(parsed);
      }
    } catch (e) {
      console.error('Error loading SRS items:', e);
    }

    try {
      const savedStreak = localStorage.getItem('nd_streak');
      if (savedStreak) {
        const parsedStreak = JSON.parse(savedStreak);
        if (parsedStreak && typeof parsedStreak === 'object') {
          setStreak(parsedStreak);
          updateStreakLogic(parsedStreak);
          return;
        }
      }
      // First active day setup
      const newStreak = { current: 1, max: 1, lastActiveDate: new Date().toDateString() };
      setStreak(newStreak);
      localStorage.setItem('nd_streak', JSON.stringify(newStreak));
    } catch (e) {
      console.error('Error loading Streak:', e);
      const newStreak = { current: 1, max: 1, lastActiveDate: new Date().toDateString() };
      setStreak(newStreak);
    }
  }, []);

  // Record a review session for Kanji, Vocab, or Grammar
  const recordReview = (itemId, quality, type) => {
    const prevItem = (srsItems || {})[itemId] || {
      interval: 0,
      easeFactor: 2.5,
      repetitions: 0,
      nextReview: 0,
      type
    };

    const sm2Result = calculateSM2(
      quality,
      prevItem.interval,
      prevItem.easeFactor,
      prevItem.repetitions
    );

    const updatedSrs = {
      ...(srsItems || {}),
      [itemId]: {
        ...sm2Result,
        type
      }
    };

    setSrsItems(updatedSrs);
    localStorage.setItem('nd_srs', JSON.stringify(updatedSrs));

    // Award XP
    const xpGain = quality >= 3 ? 15 + quality * 2 : 5; // Extra XP for better quality recall
    addXpPoints(xpGain);
  };

  // Increment XP points
  const addXpPoints = (amount) => {
    setXp((prevXp) => {
      const newXp = (prevXp || 0) + amount;
      localStorage.setItem('nd_xp', newXp.toString());

      // Check level up (every 300 XP is a level)
      const newLevel = Math.floor(newXp / 300) + 1;
      if (newLevel > level) {
        setLevel(newLevel);
        localStorage.setItem('nd_level', newLevel.toString());
        triggerLevelUpUnlocks(newLevel);
      }
      return newXp;
    });
  };

  // Trigger cottage garden unlocks on level up
  const triggerLevelUpUnlocks = (newLevel) => {
    const newItemsMap = {
      2: { id: 'cherry_blossom', name: 'Cherry Blossom Tree', emoji: '🌸', description: 'Planted on Level 2' },
      3: { id: 'lantern', name: 'Stone Lantern', emoji: '🏮', description: 'Illuminated on Level 3' },
      4: { id: 'pond', name: 'Koi Pond', emoji: '🏞️', description: 'Excavated on Level 4' },
      5: { id: 'bridge', name: 'Red Wooden Bridge', emoji: '🌉', description: 'Built on Level 5' },
      6: { id: 'torii', name: 'Miniature Torii Gate', emoji: '⛩️', description: 'Erected on Level 6' },
      7: { id: 'pagoda', name: 'Garden Pagoda', emoji: '🏯', description: 'Constructed on Level 7' }
    };

    const newItem = newItemsMap[newLevel];
    if (newItem) {
      setUnlockedItems((prev) => {
        const currentItems = prev || [];
        if (currentItems.some(item => item.id === newItem.id)) return currentItems;
        const updated = [...currentItems, newItem];
        localStorage.setItem('nd_unlocked', JSON.stringify(updated));
        return updated;
      });
    }
  };

  // Record kana progress
  const recordKanaResult = (char, syllabary, success) => {
    const syllabaryProgress = (kanaProgress || {})[syllabary] || {};
    const prevChar = syllabaryProgress[char] || { attempts: 0, successes: 0 };

    const attempts = (prevChar.attempts || 0) + 1;
    const successes = success ? (prevChar.successes || 0) + 1 : (prevChar.successes || 0);

    const updatedKana = {
      ...(kanaProgress || {}),
      [syllabary]: {
        ...syllabaryProgress,
        [char]: { attempts, successes }
      }
    };

    setKanaProgress(updatedKana);
    localStorage.setItem('nd_kana', JSON.stringify(updatedKana));

    if (success) {
      addXpPoints(5); // 5 XP per correct kana answer
    }
  };

  return {
    xp,
    level,
    streak,
    srsItems: srsItems || {},
    unlockedItems: unlockedItems || [],
    kanaProgress: kanaProgress || { hiragana: {}, katakana: {} },
    recordReview,
    addXpPoints,
    recordKanaResult
  };
};
