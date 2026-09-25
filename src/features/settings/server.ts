import { prisma } from "@/lib/db";
import { audit } from "@/lib/audit";
import { assertAdmin, type Session } from "@/lib/session";
import { SETTINGS, type Limits, type SettingKey } from "./limits";
import type { UpdateSettingsInput } from "./schemas";

export { applyBlockedReason, SETTINGS, type Limits } from "./limits";

/** Every setting, falling back to its default when no row exists. */
export async function getLimits(): Promise<Limits> {
  const rows = await prisma.setting.findMany();
  const stored = new Map(rows.map((r) => [r.key, r.value]));
  const keys = Object.keys(SETTINGS) as SettingKey[];
  return Object.fromEntries(keys.map((k) => [k, stored.get(k) ?? SETTINGS[k].default])) as Limits;
}

/** Admin: save changed limits, one audit entry per change. */
export async function updateLimits(session: Session, input: UpdateSettingsInput) {
  assertAdmin(session);
  const current = await getLimits();
  const changed = (Object.keys(input) as SettingKey[]).filter((k) => input[k] !== current[k]);
  await prisma.$transaction(
    changed.flatMap((key) => [
      prisma.setting.upsert({
        where: { key },
        create: { key, value: input[key], updatedById: session.userId },
        update: { value: input[key], updatedById: session.userId },
      }),
      audit({ actorId: session.userId, action: "SETTING_CHANGED", target: key, before: { [key]: current[key] }, after: { [key]: input[key] } }),
    ]),
  );
  return { limits: await getLimits() };
}
