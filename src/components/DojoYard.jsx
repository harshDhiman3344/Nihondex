import React from 'react';

export default function DojoYard({ unlockedItems, level }) {
  // All possible items in the garden
  const allItems = [
    { id: 'clearing', name: 'Grassy Yard', emoji: '🏡', level: 1, desc: 'Your cottage home base' },
    { id: 'cherry_blossom', name: 'Cherry Blossom', emoji: '🌸', level: 2, desc: 'A beautiful sakura tree' },
    { id: 'lantern', name: 'Stone Lantern', emoji: '🏮', level: 3, desc: 'Illuminates the garden path' },
    { id: 'pond', name: 'Koi Pond', emoji: '🏞️', level: 4, desc: 'Quiet pond with koi fishes' },
    { id: 'bridge', name: 'Wooden Bridge', emoji: '🌉', level: 5, desc: 'Arching over the stream' },
    { id: 'torii', name: 'Torii Gate', emoji: '⛩️', level: 6, desc: 'Entrance to the sacred yard' },
    { id: 'pagoda', name: 'Garden Pagoda', emoji: '🏯', level: 7, desc: 'Brings zen and clarity' }
  ];

  return (
    <div className="card-cozy garden-card">
      <div className="garden-header flex-between">
        <div>
          <h3 className="garden-title font-hand">My Cottage Garden</h3>
          <p className="garden-desc">Level up to expand your cozy yard and plant new elements!</p>
        </div>
        <div className="garden-level-tag flex-center font-bold">
          Level {level}
        </div>
      </div>

      {/* Visual Garden Layout */}
      <div className="garden-visualizer-box">
        <div className="garden-plot-grid">
          {allItems.map((item) => {
            const isUnlocked = level >= item.level;
            return (
              <div 
                key={item.id} 
                className={`garden-slot flex-center flex-col ${isUnlocked ? 'slot-unlocked animate-float' : 'slot-locked'}`}
                style={{ animationDelay: `${item.level * 0.2}s` }}
              >
                {isUnlocked ? (
                  <>
                    <span className="slot-emoji">{item.emoji}</span>
                    <span className="slot-name font-hand">{item.name}</span>
                  </>
                ) : (
                  <>
                    <span className="slot-emoji-locked">🔒</span>
                    <span className="slot-name-locked font-hand">Lv. {item.level}</span>
                  </>
                )}
                
                {/* Tooltip detail on hover */}
                <div className="slot-tooltip font-sans">
                  <strong>{item.name}</strong>
                  <p>{isUnlocked ? item.desc : `Unlocks at Level ${item.level}`}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
