export const STORAGE_KEY = "buyingbuddy-guided-inspection-v3";

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
  // EXTERIOR
  {
    id: 1,
    section: "Exterior",
    title: "Panel Gaps",
    instructions: "Walk around the car. Check if the gaps between doors, bonnet, and boot are even. Uneven gaps often mean crash repairs.",
    notePlaceholder: "Are any panels misaligned?",
  },
  {
    id: 2,
    section: "Exterior",
    title: "Paint Match",
    instructions: "Stand back and look at the car in natural light. Does the paint on the doors match the bumpers and guards?",
    notePlaceholder: "Any panels looking slightly different?",
  },
  {
    id: 3,
    section: "Exterior",
    title: "All Lights",
    instructions: "Turn on the headlights, hazards, and ask someone to check the brake lights and reverse lights.",
    notePlaceholder: "Any blown bulbs or cracked lenses?",
  },
  {
    id: 4,
    section: "Exterior",
    title: "Tyres",
    instructions: "Look at all four tyres. Do they have legal tread depth? Are they wearing evenly across the surface?",
    notePlaceholder: "Bald edges or mismatched brands?",
  },
  {
    id: 5,
    section: "Exterior",
    title: "Rust Check",
    instructions: "Look closely around the bottom of the doors, the wheel arches, and the boot for bubbling paint or visible rust.",
    notePlaceholder: "Any rust spots found?",
  },
  {
    id: 6,
    section: "Exterior",
    title: "Windscreen",
    instructions: "Check the windscreen for any large cracks, star chips, or heavy scratching.",
    notePlaceholder: "Chips in the driver's line of sight?",
  },

  // INTERIOR
  {
    id: 7,
    section: "Interior",
    title: "Electrics",
    instructions: "Test every window, the door locks, the mirrors, and the sunroof if it has one. Make sure it all goes up and down.",
    notePlaceholder: "Any sticky windows or broken switches?",
  },
  {
    id: 8,
    section: "Interior",
    title: "Air Conditioning",
    instructions: "Start the engine and blast the AC on cold. It should be freezing within a minute.",
    notePlaceholder: "Is the air blowing hot?",
  },
  {
    id: 9,
    section: "Interior",
    title: "Smell",
    instructions: "Sit inside with the doors closed. Does it smell like damp carpet, mould, or heavy smoke?",
    notePlaceholder: "Any weird smells?",
  },
  {
    id: 10,
    section: "Interior",
    title: "Dashboard Lights",
    instructions: "When the engine starts, all warning lights should turn off. Are any lights (like engine, airbag) staying on?",
    notePlaceholder: "Which lights are staying on?",
  },
  {
    id: 11,
    section: "Interior",
    title: "Seats",
    instructions: "Check if the seats adjust properly (forward, back, recline) and look for heavy tears or damage.",
    notePlaceholder: "Broken seat mechanisms or big rips?",
  },
  {
    id: 12,
    section: "Interior",
    title: "Keys",
    instructions: "Check if the central locking works on the remote. Does the key turn easily in the ignition or doors?",
    notePlaceholder: "Missing spare key or sticky locks?",
  },

  // ENGINE
  {
    id: 13,
    section: "Engine",
    title: "Oil Cap",
    instructions: "With the engine OFF, unscrew the oil cap. It should be oily, not covered in a thick milky/white paste (head gasket warning).",
    notePlaceholder: "Milky residue under the cap?",
  },
  {
    id: 14,
    section: "Engine",
    title: "Visible Leaks",
    instructions: "Look down into the engine bay and under the car. Are there any fresh, wet puddles or heavy oil caked onto the engine?",
    notePlaceholder: "Wet oil or coolant spots?",
  },
  {
    id: 15,
    section: "Engine",
    title: "Damage & Wires",
    instructions: "Look around for broken plastic, dodgy electrical tape, or exposed wires.",
    notePlaceholder: "Anything look DIY or broken?",
  },

  // TEST DRIVE
  {
    id: 16,
    section: "Test Drive",
    title: "Start & Idle",
    instructions: "Does the engine start instantly? Does it idle smoothly without shuddering or hunting for revs?",
    notePlaceholder: "Rough start or unstable idle?",
  },
  {
    id: 17,
    section: "Test Drive",
    title: "Braking",
    instructions: "When safe, brake firmly. The car should stop straight. You shouldn't feel shaking in the steering wheel.",
    notePlaceholder: "Shuddering or pulling to one side?",
  },
  {
    id: 18,
    section: "Test Drive",
    title: "Noises",
    instructions: "Listen closely with the radio off and windows down. Hear any clunks, whining, or grinding sounds?",
    notePlaceholder: "Weird noises when turning or accelerating?",
  },

  // PAPERWORK
  {
    id: 19,
    section: "Paperwork",
    title: "VIN Check",
    instructions: "Check the VIN plate on the car. Does it exactly match the rego papers or the seller's ad?",
    notePlaceholder: "VIN doesn't match?",
  },
  {
    id: 20,
    section: "Paperwork",
    title: "Service Books",
    instructions: "Look at the logbook. Are the services regular? Are there big missing gaps in the history?",
    notePlaceholder: "Missing books or big service gaps?",
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
        "The quick inspection landed in the safe zone. Keep your head on, verify the paperwork, and negotiate hard.",
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
        "There is enough risk here that you should slow down and get a proper pre-purchase inspection before you commit.",
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
      "Too many red flags for a clean private-sale buy. Park it and go find a better one.",
    redCount,
    amberCount,
    okCount,
    skippedCount,
    flaggedItems,
  };
}