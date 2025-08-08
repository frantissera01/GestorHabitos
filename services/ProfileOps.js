// services/ProfileOps.js
import * as ProfileService from './ProfileService';
import * as HabitService from './HabitService';

// Opción A: Reasignar hábitos del perfil borrado al perfil target
export async function deleteProfileAndReassign(deletedId, targetProfileId) {
  const habits = await HabitService.getHabits();
  const nextHabits = habits.map(h =>
    String(h.profileId) === String(deletedId) ? { ...h, profileId: targetProfileId } : h
  );
  await HabitService.saveHabits(nextHabits);
  await ProfileService.removeProfile(deletedId);
  return { profiles: await ProfileService.getProfiles(), habits: nextHabits };
}
