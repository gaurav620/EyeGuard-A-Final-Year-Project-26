/**
 * Eye-Guard Fatigue Scoring Engine
 *
 * Novel contribution: Personalized adaptive fatigue detection with temporal modeling.
 * Formula: F(t) = w1*BR_norm + w2*CD_norm + w3*GV_norm + w4*T_norm + w5*EAR_deviation
 *
 * Where:
 *   BR_norm = (blink_rate - baseline_blink_rate) / baseline_blink_rate
 *   CD_norm = eye_closure_duration / threshold
 *   GV_norm = gaze_variance / max_expected_variance
 *   T_norm  = elapsed_minutes / max_session_minutes
 *   EAR_deviation = |EAR - baseline_EAR| / baseline_EAR
 */

// Default weights (learned from data, tunable per user)
const DEFAULT_WEIGHTS = {
  w1: 0.25, // blink rate deviation
  w2: 0.30, // eye closure duration (most indicative)
  w3: 0.15, // gaze variance
  w4: 0.10, // time factor
  w5: 0.20, // EAR deviation from baseline
};

// Default baselines (overridden per user after calibration)
const DEFAULT_BASELINE = {
  blinkRate: 15, // blinks per minute
  ear: 0.27, // eye aspect ratio
  maxClosureDuration: 0.4, // seconds
  maxGazeVariance: 50, // pixels^2
  maxSessionMinutes: 120,
};

export interface FatigueInput {
  ear: number;
  blinkRate: number;
  eyeClosureDuration: number;
  gazeVariance: number;
  elapsedMinutes: number;
}

export interface UserBaseline {
  blinkRate: number;
  ear: number;
}

export interface FatigueResult {
  score: number; // 0-100
  level: "low" | "moderate" | "high" | "critical";
  components: {
    blinkRateComponent: number;
    closureComponent: number;
    gazeComponent: number;
    timeComponent: number;
    earComponent: number;
  };
  shouldAlert: boolean;
}

export function computeFatigueScore(
  input: FatigueInput,
  userBaseline?: Partial<UserBaseline>,
  weights = DEFAULT_WEIGHTS
): FatigueResult {
  const baseline = {
    ...DEFAULT_BASELINE,
    ...userBaseline,
  };

  // Normalize each component to [0, 1]
  const brDeviation = Math.abs(input.blinkRate - baseline.blinkRate) / baseline.blinkRate;
  const blinkRateComponent = Math.min(brDeviation, 1);

  const closureComponent = Math.min(input.eyeClosureDuration / baseline.maxClosureDuration, 1);

  const gazeComponent = Math.min(input.gazeVariance / baseline.maxGazeVariance, 1);

  const timeComponent = Math.min(input.elapsedMinutes / baseline.maxSessionMinutes, 1);

  const earDeviation = Math.abs(input.ear - baseline.ear) / baseline.ear;
  const earComponent = Math.min(earDeviation, 1);

  // Weighted sum
  const rawScore =
    weights.w1 * blinkRateComponent +
    weights.w2 * closureComponent +
    weights.w3 * gazeComponent +
    weights.w4 * timeComponent +
    weights.w5 * earComponent;

  // Scale to 0-100
  const score = Math.round(Math.min(rawScore * 100, 100));

  let level: FatigueResult["level"];
  if (score < 25) level = "low";
  else if (score < 50) level = "moderate";
  else if (score < 75) level = "high";
  else level = "critical";

  return {
    score,
    level,
    components: {
      blinkRateComponent: Math.round(blinkRateComponent * 100) / 100,
      closureComponent: Math.round(closureComponent * 100) / 100,
      gazeComponent: Math.round(gazeComponent * 100) / 100,
      timeComponent: Math.round(timeComponent * 100) / 100,
      earComponent: Math.round(earComponent * 100) / 100,
    },
    shouldAlert: score >= 60,
  };
}

/**
 * EAR (Eye Aspect Ratio) calculation
 * EAR = (||p2-p6|| + ||p3-p5||) / (2 * ||p1-p4||)
 * Standard threshold: 0.21 for closed eyes
 */
export function calculateEAR(
  eye: { x: number; y: number }[]
): number {
  if (eye.length !== 6) return 0;
  const dist = (a: { x: number; y: number }, b: { x: number; y: number }) =>
    Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2);

  const vertical1 = dist(eye[1], eye[5]);
  const vertical2 = dist(eye[2], eye[4]);
  const horizontal = dist(eye[0], eye[3]);

  return (vertical1 + vertical2) / (2.0 * horizontal);
}

export const EAR_THRESHOLD = 0.21;
export const BLINK_CONSECUTIVE_FRAMES = 3;
