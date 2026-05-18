import {
  pgTable,
  uuid,
  text,
  integer,
  real,
  timestamp,
  boolean,
  pgEnum,
  jsonb,
  index,
} from "drizzle-orm/pg-core";

export const genderEnum = pgEnum("gender", ["male", "female", "other", "prefer_not_to_say"]);
export const lightingEnum = pgEnum("lighting_condition", ["bright", "moderate", "dim", "dark"]);
export const deviceEnum = pgEnum("device_type", ["laptop", "desktop", "tablet", "phone"]);
export const fatigueLevelEnum = pgEnum("fatigue_level", ["normal", "mild", "moderate", "severe"]);
export const modelTypeEnum = pgEnum("model_type", ["threshold", "cnn", "lstm", "gru"]);
export const eyeConditionEnum = pgEnum("eye_condition", [
  "none",
  "myopia",
  "hyperopia",
  "astigmatism",
  "dry_eye",
  "other",
]);

export const users = pgTable("users", {
  id: uuid("id").defaultRandom().primaryKey(),
  clerkId: text("clerk_id").unique().notNull(),
  email: text("email"),
  name: text("name"),
  age: integer("age"),
  gender: genderEnum("gender"),
  screenTimeHours: real("screen_time_hours"),
  eyeCondition: eyeConditionEnum("eye_condition").default("none"),
  deviceType: deviceEnum("device_type"),
  baselineEAR: real("baseline_ear"),
  baselineBlinkRate: real("baseline_blink_rate"),
  baselineClosureDuration: real("baseline_closure_duration"),
  baselineGazeVariance: real("baseline_gaze_variance"),
  isResearchParticipant: boolean("is_research_participant").default(false),
  consentGiven: boolean("consent_given").default(false),
  participantCode: text("participant_code").unique(),
  totalSessions: integer("total_sessions").default(0),
  totalMinutes: real("total_minutes").default(0),
  contributionPoints: integer("contribution_points").default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const sessions = pgTable("sessions", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id")
    .references(() => users.id)
    .notNull(),
  startedAt: timestamp("started_at").defaultNow().notNull(),
  endedAt: timestamp("ended_at"),
  durationMinutes: real("duration_minutes"),
  lightingCondition: lightingEnum("lighting_condition"),
  avgFatigueScore: real("avg_fatigue_score"),
  maxFatigueScore: real("max_fatigue_score"),
  totalBlinks: integer("total_blinks").default(0),
  avgBlinkRate: real("avg_blink_rate"),
  avgEAR: real("avg_ear"),
  alertsTriggered: integer("alerts_triggered").default(0),
  selfReportFatigue: integer("self_report_fatigue"),
  fatigueLevel: fatigueLevelEnum("fatigue_level"),
  meta: jsonb("meta"),
  notes: text("notes"),
});

export const telemetry = pgTable(
  "telemetry",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    sessionId: uuid("session_id")
      .references(() => sessions.id)
      .notNull(),
    timestamp: timestamp("timestamp").defaultNow().notNull(),
    ear: real("ear").notNull(),
    blinkRate: real("blink_rate").notNull(),
    eyeClosureDuration: real("eye_closure_duration").notNull(),
    gazeVariance: real("gaze_variance").notNull(),
    fatigueScore: real("fatigue_score").notNull(),
    fatigueLevel: fatigueLevelEnum("fatigue_level"),
    isBlinking: boolean("is_blinking").default(false),
    leftEAR: real("left_ear"),
    rightEAR: real("right_ear"),
    gazeX: real("gaze_x"),
    gazeY: real("gaze_y"),
  },
  (table) => ({
    sessionTimestampIdx: index("telemetry_session_timestamp_idx").on(
      table.sessionId,
      table.timestamp
    ),
  })
);

export const researchData = pgTable("research_data", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id")
    .references(() => users.id)
    .notNull(),
  sessionId: uuid("session_id")
    .references(() => sessions.id)
    .notNull(),
  modelFatigueScore: real("model_fatigue_score").notNull(),
  selfReportScore: integer("self_report_score"),
  hybridLabel: real("hybrid_label"),
  sourceModel: modelTypeEnum("source_model").default("lstm"),
  labelingWeightModel: real("labeling_weight_model").default(0.7),
  labelingWeightHuman: real("labeling_weight_human").default(0.3),
  timestamp: timestamp("timestamp").defaultNow().notNull(),
});

export const modelEvaluations = pgTable("model_evaluations", {
  id: uuid("id").defaultRandom().primaryKey(),
  modelType: modelTypeEnum("model_type").notNull(),
  version: text("version").notNull(),
  precision: real("precision").notNull(),
  recall: real("recall").notNull(),
  f1Score: real("f1_score").notNull(),
  accuracy: real("accuracy").notNull(),
  confusionMatrix: jsonb("confusion_matrix").notNull(),
  crossValidationFold: integer("cross_validation_fold"),
  comparedWith: text("compared_with"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const participantEvents = pgTable("participant_events", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").references(() => users.id),
  eventType: text("event_type").notNull(),
  points: integer("points").default(0),
  payload: jsonb("payload"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Session = typeof sessions.$inferSelect;
export type NewSession = typeof sessions.$inferInsert;
export type Telemetry = typeof telemetry.$inferSelect;
export type NewTelemetry = typeof telemetry.$inferInsert;
export type ModelEvaluation = typeof modelEvaluations.$inferSelect;
export type NewModelEvaluation = typeof modelEvaluations.$inferInsert;
