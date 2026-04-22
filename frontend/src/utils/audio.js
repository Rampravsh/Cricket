import { Audio } from 'expo-av';

const SOUNDS = {
  four: 'https://actions.google.com/sounds/v1/crowds/light_audience_applause.ogg',
  six: 'https://actions.google.com/sounds/v1/crowds/female_cheer.ogg',
  wicket: 'https://actions.google.com/sounds/v1/alarms/spaceship_alarm.ogg',
};

// Cache loaded sound objects
const loadedSounds = {};

export const playSound = async (type) => {
  try {
    const uri = SOUNDS[type];
    if (!uri) return;

    if (!loadedSounds[type]) {
       const { sound } = await Audio.Sound.createAsync({ uri });
       loadedSounds[type] = sound;
    }
    
    // Play from beginning
    await loadedSounds[type].replayAsync();
  } catch (err) {
    console.warn(`[Audio] Failed to play sound for ${type}:`, err);
  }
};
