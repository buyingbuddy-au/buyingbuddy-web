export const STORAGE_KEY = "buyingbuddy-guided-inspection-v4";

export type Stage = "intro" | "inspection" | "results";
export type Flag = "ok" | "amber" | "red" | null;

export interface Checkpoint {
  id: number;
  section: string;
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
  skipped: boolean;
}

export interface InspectionSession {
  stage: Stage;
  currentStep: number;
  startedAt: string | null;
  vehicle: VehicleDetails;
  checkpoints: CheckpointState[];
  skippedSections: string[];
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
  skippedCount: number;
  flaggedItems: FlaggedCheckpointSummary[];
}

export const checkpoints: Checkpoint[] = [
  {
    id: 1,
    section: "Exterior",
    title: "Panels & Paint",
    instructions:
      "Walk around the car and look from a distance. Do the doors, guards and bumpers line up properly, and does the paint look like the same colour all the way around?",
    notePlaceholder: "Uneven gaps, overspray or mismatched paint?",
  },
  {
    id: 2,
    section: "Exterior",
    title: "Lights & Lenses",
    instructions:
      "Check the headlights, indicators, brake lights and reverse lights. Also look for cracked lenses or moisture inside them.",
    notePlaceholder: "Any lights not working or damaged?",
  },
  {
    id: 3,
    section: "Exterior",
    title: "Tyres",
    instructions:
      "Look at all four tyres. They should have decent tread and wear evenly. If one side is bald or one tyre is a totally different brand, that's a warning sign.",
    notePlaceholder: "Uneven wear or dodgy tyres?",
  },
  {
    id: 4,
    section: "Exterior",
    title: "Glass & Mirrors",
    instructions:
      "Check the windscreen and mirrors for big cracks, nasty chips or broken housings. Focus on damage that would annoy you or cost money straight away.",
    notePlaceholder: "Cracks, chips or broken mirrors?",
  },
  {
    id: 5,
    section: "Interior",
    title: "Windows & Locks",
    instructions:
      "Test every window and the central locking. If it has powered mirrors, test them too. You want everything opening and closing normally.",
    notePlaceholder: "Any window, lock or mirror not working?",
  },
  {
    id: 6,
    section: "Interior",
    title: "Air Con & Fan",
    instructions:
      "Start the car and run the AC on cold. Make sure the fan works properly and the air actually gets cold, not just noisy.",
    notePlaceholder: "Weak fan or no cold air?",
  },
  {
    id: 7,
    section: "Interior",
    title: "Dash Warning Lights",
    instructions:
      "When the engine starts, the normal dash lights should come on briefly, then turn off. If engine, ABS or airbag lights stay on, that's a problem.",
    notePlaceholder: "Which warning lights stayed on?",
  },
  {
    id: 8,
    section: "Interior",
    title: "Smell & Wear",
    instructions:
      "Sit in the car with the doors shut. Look for cigarette smell, mould, damp carpet or interior wear that feels worse than the kilometres suggest.",
    notePlaceholder: "Bad smell or excessive wear?",
  },
  {
    id: 9,
    section: "Drive",
    title: "Start & Idle",
    instructions:
      "Start the engine and listen. It should fire up cleanly and settle into a smooth idle, not shake, race or sound rough.",
    notePlaceholder: "Hard start or rough idle?",
  },
  {
    id: 10,
    section: "Drive",
    title: "Steering & Brakes",
    instructions:
      "Drive it somewhere safe. The steering should feel straight and the brakes should pull the car up cleanly without shaking or dragging to one side.",
    notePlaceholder: "Pulling, shuddering or weak brakes?",
  },
  {
    id: 11,
    section: "Drive",
    title: "Noises & Vibration",
    instructions:
      "Turn the radio off and listen during the drive. Watch for clunks, whining, grinding or annoying vibrations through the wheel or seat.",
    notePlaceholder: "What noise or vibration did you notice?",
  },
  {
    id: 12,
    section: "Paperwork",
    title: "VIN Matches Papers",
    instructions:
      "Check the VIN on the car and make sure it matches the rego papers or ad exactly. One wrong character is a massive issue.",
    notePlaceholder: "VIN mismatch or missing plate?",
  },
  {
    id: 13,
    section: "Paperwork",
    title: "Service History",
    instructions:
      "Ask for the service book or invoices. You're looking for reasonable evidence the car has actually been maintained, not perfection.",
    notePlaceholder: "Missing history or huge service gaps?",
  },
  {
    id: 14,
    section: "Paperwork",
    title: "Seller Details",
    instructions:
      "Make sure the seller's name lines up with the rego papers or they can clearly explain why they're selling it for someone else.",
    notePlaceholder: "Seller details not lining up?",
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
      skipped: false,
    })),
    skippedSections: [],
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
        skipped: typeof source?.skipped === "boolean" ? source.skipped : false,
      };
    });

    const answeredCount = restoredCheckpoints.filter(
      (checkpointState) => checkpointState.flag !== null || checkpointState.skipped,
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
      skippedSections: Array.isArray(parsed.skippedSections) ? parsed.skippedSections : [],
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
  let skippedCount = 0;

  const flaggedItems: FlaggedCheckpointSummary[] = [];

  session.checkpoints.forEach((checkpointState, index) => {
    if (checkpointState.skipped) {
      skippedCount += 1;
      return;
    }

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
        "The basic checks look clean. Still verify the paperwork and don't skip PPSR before you hand over money.",
      redCount,
      amberCount,
      okCount,
      skippedCount,
      flaggedItems,
    };
  }

  if (score >= 5) {
    return {
      score,
      verdict: "Caution",
      verdictDetail:
        "There are enough concerns here that you should slow down and get a proper pre-purchase inspection before committing.",
      redCount,
      amberCount,
      okCount,
      skippedCount,
      flaggedItems,
    };
  }

  return {
    score,
    verdict: "Walk Away",
    verdictDetail:
      "Too many red flags for a clean private-sale buy. Park it and move on to a better car.",
    redCount,
    amberCount,
    okCount,
    skippedCount,
    flaggedItems,
  };
}
