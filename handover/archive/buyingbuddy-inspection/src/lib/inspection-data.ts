export const STORAGE_KEY = "buyingbuddy-guided-inspection-v2";

export type Stage = "intro" | "inspection" | "results";
export type Flag = "ok" | "amber" | "red" | null;

export interface Checkpoint {
  id: number;
  title: string;
  instructions: string;
  notePlaceholder: string;
}

export interface VehicleDetails {
  year: string;
  make: string;
  model: string;
  price: string;
}

export interface CheckpointState {
  flag: Flag;
  note: string;
}

export interface InspectionSession {
  stage: Stage;
  currentStep: number;
  startedAt: string | null;
  vehicle: VehicleDetails;
  checkpoints: CheckpointState[];
}

export interface FlaggedCheckpointSummary {
  checkpoint: Checkpoint;
  severity: Exclude<Flag, null | "ok">;
  note: string;
  label: string;
}

export interface InspectionSummary {
  score: number;
  verdict: "Buy" | "Caution" | "Walk Away";
  verdictDetail: string;
  redCount: number;
  amberCount: number;
  okCount: number;
  flaggedItems: FlaggedCheckpointSummary[];
}

export const checkpoints: Checkpoint[] = [
  {
    id: 1,
    title: "Exterior Overview",
    instructions:
      "Stand back and scan the whole car. Look for uneven stance, mismatched panels, obvious dents, and signs it has had a hard life.",
    notePlaceholder: "Anything obvious before you move closer?",
  },
  {
    id: 2,
    title: "Paint Front",
    instructions:
      "Check the bonnet, front bar, and guards for colour mismatch, stone rash, clear coat peel, or repairs that do not line up.",
    notePlaceholder: "Front-end paint issues or repair signs?",
  },
  {
    id: 3,
    title: "Paint Left",
    instructions:
      "Walk the left side slowly. Look down the panels for ripples, inconsistent gaps, scratches, and overspray.",
    notePlaceholder: "Left side damage, waviness, or bad paint?",
  },
  {
    id: 4,
    title: "Paint Right",
    instructions:
      "Repeat the same check on the right side. Watch for poor panel fit, door dings, and colour differences.",
    notePlaceholder: "Right side damage or paint mismatch?",
  },
  {
    id: 5,
    title: "Paint Rear",
    instructions:
      "Check the boot lid, rear guards, and bumper. Rear impact repairs often show up in bad alignment or cheap repaint work.",
    notePlaceholder: "Rear-end damage or repair signs?",
  },
  {
    id: 6,
    title: "Windscreen",
    instructions:
      "Look for chips, cracks, hazing, wiper scratches, and signs the screen has been replaced badly.",
    notePlaceholder: "Any chips, cracks, or glass issues?",
  },
  {
    id: 7,
    title: "Tyres Front",
    instructions:
      "Check both front tyres for tread depth and even wear. Uneven wear can point to suspension, steering, or alignment issues.",
    notePlaceholder: "Front tyre wear, brand mismatch, or bald edges?",
  },
  {
    id: 8,
    title: "Tyres Rear",
    instructions:
      "Check the rear tyres the same way. Rear tyres should still have decent tread and should not be chopped out or badly worn.",
    notePlaceholder: "Rear tyre wear or mismatched rubber?",
  },
  {
    id: 9,
    title: "Wheels",
    instructions:
      "Inspect the rims for major kerb rash, cracks, buckles, or missing wheel nuts and centre caps.",
    notePlaceholder: "Wheel damage or signs of impact?",
  },
  {
    id: 10,
    title: "Under Car",
    instructions:
      "Crouch down and look underneath. Watch for fresh scrapes, bent metal, rust, hanging trims, and fluid leaks.",
    notePlaceholder: "Any leaks, rust, or underside damage?",
  },
  {
    id: 11,
    title: "Engine Bay",
    instructions:
      "Open the bonnet and take in the whole engine bay. Look for missing covers, loose wiring, crash repair signs, or heavy grime.",
    notePlaceholder: "Anything missing, tampered with, or suspicious?",
  },
  {
    id: 12,
    title: "Oil Level",
    instructions:
      "Check the dipstick. Make sure the oil is on the mark and does not look burnt, sludgy, or contaminated.",
    notePlaceholder: "Oil level or oil condition concerns?",
  },
  {
    id: 13,
    title: "Coolant",
    instructions:
      "Check the coolant bottle when safe to do so. It should sit in range and look clean, not rusty, oily, or empty.",
    notePlaceholder: "Coolant low, dirty, or crusty around the cap?",
  },
  {
    id: 14,
    title: "Battery",
    instructions:
      "Check the battery terminals and case. Look for corrosion, swelling, loose clamps, or a battery that looks ancient.",
    notePlaceholder: "Battery corrosion or age concerns?",
  },
  {
    id: 15,
    title: "Engine Leaks",
    instructions:
      "Look around the engine and below it for oil, coolant, and wet spots. Fresh leaks matter more than old dust.",
    notePlaceholder: "Where are the leaks or wet spots?",
  },
  {
    id: 16,
    title: "Interior",
    instructions:
      "Check the overall cabin condition. Smells, wear, broken trims, and cheap repairs usually tell the real story.",
    notePlaceholder: "How does the interior present overall?",
  },
  {
    id: 17,
    title: "Dashboard Lights",
    instructions:
      "Start the car and watch the cluster. Warning lights should come on, then clear normally. Anything staying on is a problem.",
    notePlaceholder: "Which warning lights stayed on, if any?",
  },
  {
    id: 18,
    title: "Odometer",
    instructions:
      "Check the kilometres and compare them to the car's condition, service history, and seller story.",
    notePlaceholder: "Do the kms make sense for this car?",
  },
  {
    id: 19,
    title: "Seats",
    instructions:
      "Check front and rear seats for tears, broken trim, sagging bolsters, stains, and cigarette burns.",
    notePlaceholder: "Seat wear, smells, or broken mechanisms?",
  },
  {
    id: 20,
    title: "Boot",
    instructions:
      "Open the boot and look under the floor. Watch for water marks, mould, accident repairs, or missing trim pieces.",
    notePlaceholder: "Boot condition, water damage, or missing trims?",
  },
  {
    id: 21,
    title: "Spare Tyre",
    instructions:
      "Check that the spare tyre, jack, and tools are actually there and usable.",
    notePlaceholder: "Spare missing, flat, or tools missing?",
  },
  {
    id: 22,
    title: "Service Book",
    instructions:
      "Ask for the service book and look for regular entries. Gaps, missing books, and sketchy history reduce confidence fast.",
    notePlaceholder: "Service history gaps or missing stamps?",
  },
  {
    id: 23,
    title: "Rego Papers",
    instructions:
      "Check the registration paperwork lines up with the seller, the plate, and the car in front of you.",
    notePlaceholder: "Any paperwork mismatch or issue?",
  },
  {
    id: 24,
    title: "VIN",
    instructions:
      "Find the VIN plate or stamped VIN and make sure it is readable, untampered, and matches the paperwork.",
    notePlaceholder: "VIN issue, mismatch, or tamper signs?",
  },
  {
    id: 25,
    title: "Test Drive",
    instructions:
      "Drive it properly if the seller allows it. Listen for rattles, watch how it shifts, brakes, tracks straight, and handles bumps.",
    notePlaceholder: "What did the car do on the test drive?",
  },
];

export const TOTAL_CHECKPOINTS = checkpoints.length;

export function createEmptySession(): InspectionSession {
  return {
    stage: "intro",
    currentStep: 0,
    startedAt: null,
    vehicle: {
      year: "",
      make: "",
      model: "",
      price: "",
    },
    checkpoints: checkpoints.map(() => ({
      flag: null,
      note: "",
    })),
  };
}

function isStage(value: unknown): value is Stage {
  return value === "intro" || value === "inspection" || value === "results";
}

function isFlag(value: unknown): value is Flag {
  return value === null || value === "ok" || value === "amber" || value === "red";
}

export function restoreSession(raw: string): InspectionSession | null {
  try {
    const parsed = JSON.parse(raw) as Partial<InspectionSession>;
    const base = createEmptySession();

    if (!parsed || typeof parsed !== "object") {
      return null;
    }

    const restoredCheckpoints = checkpoints.map((_, index) => {
      const source = Array.isArray(parsed.checkpoints) ? parsed.checkpoints[index] : null;

      return {
        flag: isFlag(source?.flag) ? source.flag : null,
        note: typeof source?.note === "string" ? source.note : "",
      };
    });

    const answeredCount = restoredCheckpoints.filter(
      (checkpointState) => checkpointState.flag !== null,
    ).length;
    const requestedStage = isStage(parsed.stage) ? parsed.stage : base.stage;
    const stage =
      requestedStage === "results" && answeredCount < TOTAL_CHECKPOINTS
        ? "inspection"
        : requestedStage;

    return {
      stage,
      currentStep:
        typeof parsed.currentStep === "number"
          ? Math.max(0, Math.min(TOTAL_CHECKPOINTS - 1, Math.round(parsed.currentStep)))
          : Math.min(answeredCount, TOTAL_CHECKPOINTS - 1),
      startedAt: typeof parsed.startedAt === "string" ? parsed.startedAt : null,
      vehicle: {
        year: typeof parsed.vehicle?.year === "string" ? parsed.vehicle.year : "",
        make: typeof parsed.vehicle?.make === "string" ? parsed.vehicle.make : "",
        model: typeof parsed.vehicle?.model === "string" ? parsed.vehicle.model : "",
        price: typeof parsed.vehicle?.price === "string" ? parsed.vehicle.price : "",
      },
      checkpoints: restoredCheckpoints,
    };
  } catch {
    return null;
  }
}

function getFlagLabel(flag: Exclude<Flag, null | "ok">): string {
  return flag === "red" ? "Problem" : "Concern";
}

export function getInspectionSummary(session: InspectionSession): InspectionSummary {
  let redCount = 0;
  let amberCount = 0;
  let okCount = 0;

  const flaggedItems: FlaggedCheckpointSummary[] = [];

  session.checkpoints.forEach((checkpointState, index) => {
    if (checkpointState.flag === "red") {
      redCount += 1;
      flaggedItems.push({
        checkpoint: checkpoints[index],
        severity: "red",
        note: checkpointState.note.trim(),
        label: getFlagLabel("red"),
      });
      return;
    }

    if (checkpointState.flag === "amber") {
      amberCount += 1;
      flaggedItems.push({
        checkpoint: checkpoints[index],
        severity: "amber",
        note: checkpointState.note.trim(),
        label: getFlagLabel("amber"),
      });
      return;
    }

    if (checkpointState.flag === "ok") {
      okCount += 1;
    }
  });

  const score = Math.max(0, 10 - redCount * 2 - amberCount);

  if (score >= 8) {
    return {
      score,
      verdict: "Buy",
      verdictDetail:
        "The quick inspection landed in the safe zone. Keep your head on, verify the paperwork, and negotiate hard.",
      redCount,
      amberCount,
      okCount,
      flaggedItems,
    };
  }

  if (score >= 5) {
    return {
      score,
      verdict: "Caution",
      verdictDetail:
        "There is enough risk here that you should slow down and get a proper pre-purchase inspection before you commit.",
      redCount,
      amberCount,
      okCount,
      flaggedItems,
    };
  }

  return {
    score,
    verdict: "Walk Away",
    verdictDetail:
      "Too many red flags for a clean private-sale buy. Park it and go find a better one.",
    redCount,
    amberCount,
    okCount,
    flaggedItems,
  };
}
