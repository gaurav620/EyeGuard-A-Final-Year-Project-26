import { randomUUID } from "node:crypto";
import { db } from "@/lib/db";
import { incrementLeaderboard, incrementStat } from "@/lib/redis";
import { participantEvents, users } from "@/lib/schema";
import { jsonError, jsonOk } from "@/lib/server/api";

type JoinPayload = {
  clerkId: string;
  email?: string;
  name?: string;
  age?: number;
  gender?: "male" | "female" | "other" | "prefer_not_to_say";
  screenTimeHours?: number;
  eyeCondition?: "none" | "myopia" | "hyperopia" | "astigmatism" | "dry_eye" | "other";
  deviceType?: "laptop" | "desktop" | "tablet" | "phone";
};

export async function POST(req: Request) {
  const body = (await req.json()) as Partial<JoinPayload>;
  if (!body.clerkId) {
    return jsonError("clerkId is required.", 422);
  }

  const participantCode = `EG-${randomUUID().slice(0, 8).toUpperCase()}`;

  const [created] = await db
    .insert(users)
    .values({
      clerkId: body.clerkId,
      email: body.email ?? null,
      name: body.name ?? null,
      age: body.age ?? null,
      gender: body.gender ?? null,
      screenTimeHours: body.screenTimeHours ?? null,
      eyeCondition: body.eyeCondition ?? "none",
      deviceType: body.deviceType ?? null,
      isResearchParticipant: true,
      consentGiven: true,
      participantCode,
      contributionPoints: 50,
    })
    .onConflictDoNothing()
    .returning({ id: users.id, participantCode: users.participantCode, name: users.name });

  if (!created) {
    return jsonError("Participant already exists or could not be created.", 409);
  }

  await db.insert(participantEvents).values({
    userId: created.id,
    eventType: "join_research",
    points: 50,
    payload: { source: "community_page" },
  });

  await incrementStat("participants", 1);
  await incrementLeaderboard(created.participantCode ?? created.id, 50);

  return jsonOk({
    id: created.id,
    participantCode: created.participantCode,
    name: created.name,
  });
}

