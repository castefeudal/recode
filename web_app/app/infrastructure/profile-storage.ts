import { DEFAULT_PROFILE, normalizeProfile, type UserProfile } from "../domain/profile";

export const PROFILE_KEY = "markovmade-recode-profile-v1";

export function loadUserProfile(storage: Storage): UserProfile {
  const raw = storage.getItem(PROFILE_KEY);
  if (!raw) return { ...DEFAULT_PROFILE, enabledModules: [...DEFAULT_PROFILE.enabledModules] };
  try {
    return normalizeProfile(JSON.parse(raw));
  } catch {
    return { ...DEFAULT_PROFILE, enabledModules: [...DEFAULT_PROFILE.enabledModules] };
  }
}

export function persistUserProfile(storage: Storage, profile: UserProfile): void {
  storage.setItem(PROFILE_KEY, JSON.stringify(normalizeProfile(profile)));
}
