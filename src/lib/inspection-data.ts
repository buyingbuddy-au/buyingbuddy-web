export const STORAGE_KEY = "buyingbuddy-guided-inspection-v2";

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
    title: "Exterior Overview",
    instructions:
      "Stand back and scan the whole car. Look for uneven stance, mismatched panels, obvious dents, and signs it has had a hard life. Check for inconsistent panel gaps which often hide poor repair work.",
    notePlaceholder: "Anything obvious before you move closer?",
  },
  {
    id: 2,
    section: "Exterior",
    title: "Paint Front",
    instructions:
      "Check the bonnet, front bar, and guards for colour mismatch, stone rash, clear coat peel, or repairs that do not line up. Try a small magnet test on panels to check for hidden bog/filler. Check for 'orange peel' paint texture which suggests a respray.",
    notePlaceholder: "Front-end paint issues or repair signs?",
  },
  {
    id: 3,
    section: "Exterior",
    title: "Paint Left",
    instructions:
      "Walk the left side slowly. Look down the panels for ripples, inconsistent gaps, scratches, and overspray. If possible, consider a paint depth meter rental to verify factory thickness.",
    notePlaceholder: "Left side damage, waviness, or bad paint?",
  },
  {
    id: 4,
    section: "Exterior",
    title: "Paint Right",
    instructions:
      "Repeat the same check on the right side. Watch for poor panel fit, door dings, and colour differences. Check panel gap alignment carefully between all doors and guards.",
    notePlaceholder: "Right side damage or paint mismatch?",
  },
  {
    id: 5,
    section: "Exterior",
    title: "Paint Rear",
    instructions:
      "Check the boot lid, rear guards, and bumper. Rear impact repairs often show up in bad alignment or cheap repaint work. Use a magnet to check for thick filler underneath the paint.",
    notePlaceholder: "Rear-end damage or repair signs?",
  },
  {
    id: 6,
    section: "Running Gear",
    title: "Windscreen",
    instructions:
      "Look for chips, cracks, hazing, wiper scratches, and signs the screen has been replaced badly.",
    notePlaceholder: "Any chips, cracks, or glass issues?",
  },
  {
    id: 7,
    section: "Running Gear",
    title: "Tyres Front",
    instructions:
      "Check both front tyres for tread depth and even wear. Aim for minimum 3mm for QLD safety. Uneven wear can point to suspension, steering, or alignment issues. Check for mismatched tyre brands across the axle.",
    notePlaceholder: "Front tyre wear, brand mismatch, or bald edges?",
  },
  {
    id: 8,
    section: "Running Gear",
    title: "Tyres Rear",
    instructions:
      "Check the rear tyres the same way. Rear tyres should still have decent tread and should not be chopped out or badly worn. Confirm brand matches front set.",
    notePlaceholder: "Rear tyre wear or mismatched rubber?",
  },
  {
    id: 9,
    section: "Running Gear",
    title: "Wheels",
    instructions:
      "Inspect the rims for major kerb rash, cracks, buckles, or missing wheel nuts and centre caps.",
    notePlaceholder: "Wheel damage or signs of impact?",
  },
  {
    id: 10,
    section: "Running Gear",
    title: "Under Car",
    instructions:
      "Crouch down and look underneath. Watch for fresh scrapes, bent metal, rust, hanging trims, and fluid leaks.",
    notePlaceholder: "Any leaks, rust, or underside damage?",
  },
  {
    id: 11,
    section: "Engine",
    title: "Engine Bay",
    instructions:
      "Open the bonnet and take in the whole engine bay. Look for missing covers, loose wiring, crash repair signs, or heavy grime. Check A/C on max cold now to ensure it engages.",
    notePlaceholder: "Anything missing, tampered with, or suspicious?",
  },
  {
    id: 12,
    section: "Engine",
    title: "Oil Level",
    instructions:
      "Check the dipstick. Make sure the oil is on the mark and does not look burnt, sludgy, or contaminated. If you can do a cold start, watch for blue (burning oil) or white (coolant) smoke in exhaust.",
    notePlaceholder: "Oil level or oil condition concerns?",
  },
  {
    id: 13,
    section: "Engine",
    title: "Coolant",
    instructions:
      "Check the coolant bottle when safe to do so. It should sit in range and look clean, not rusty, oily, or empty.",
    notePlaceholder: "Coolant low, dirty, or crusty around the cap?",
  },
  {
    id: 14,
    section: "Engine",
    title: "Battery",
    instructions:
      "Check the battery terminals and case. Look for corrosion, swelling, loose clamps, or a battery that looks ancient.",
    notePlaceholder: "Battery corrosion or age concerns?",
  },
  {
    id: 15,
    section: "Engine",
    title: "Engine Leaks",
    instructions:
      "Look around the engine and below it for oil, coolant, and wet spots. Fresh leaks matter more than old dust.",
    notePlaceholder: "Where are the leaks or wet spots?",
  },
  {
    id: 16,
    section: "Interior",
    title: "Interior",
    instructions:
      "Check the overall cabin condition. Smells, wear, broken trims, and cheap repairs usually tell the real story. Watch for collapsed seat foam on high-km cars. Check that all window motors work smoothly.",
    notePlaceholder: "How does the interior present overall?",
  },
  {
    id: 17,
    section: "Interior",
    title: "Dashboard Lights",
    instructions:
      "Start the car and watch the cluster. Turn key to ON without starting; all warning lights should illuminate. They should clear after starting. Anything staying on is a problem.",
    notePlaceholder: "Which warning lights stayed on, if any?",
  },
  {
    id: 18,
    section: "Interior",
    title: "Odometer",
    instructions:
      "Check the kilometres and compare them to the car's condition, service history, and seller story.",
    notePlaceholder: "Do the kms make sense for this car?",
  },
  {
    id: 19,
    section: "Interior",
    title: "Seats",
    instructions:
      "Check front and rear seats for tears, broken trim, sagging bolsters, stains, and cigarette burns.",
    notePlaceholder: "Seat wear, smells, or broken mechanisms?",
  },
  {
    id: 20,
    section: "Interior",
    title: "Boot",
    instructions:
      "Open the boot and look under the floor. Watch for water marks, mould, accident repairs, or missing trim pieces.",
    notePlaceholder: "Boot condition, water damage, or missing trims?",
  },
  {
    id: 21,
    section: "Documentation",
    title: "Spare Tyre",
    instructions:
      "Check that the spare tyre, jack, and tools are actually there and usable.",
    notePlaceholder: "Spare missing, flat, or tools missing?",
  },
  {
    id: 22,
    section: "Documentation",
    title: "Service Book",
    instructions:
      "Ask for the service book and look for regular entries. Gaps, missing books, and sketchy history reduce confidence fast.",
    notePlaceholder: "Service history gaps or missing stamps?",
  },
  {
    id: 23,
    section: "Documentation",
    title: "Rego Papers",
    instructions:
      "Check the registration paperwork lines up with the seller, the plate, and the car in front of you.",
    notePlaceholder: "Any paperwork mismatch or issue?",
  },
  {
    id: 24,
    section: "Documentation",
    title: "VIN",
    instructions:
      "Find the VIN plate or stamped VIN and make sure it is readable, untampered, and matches the paperwork. Check the chassis number on the compliance plate for signs of re-stamping.",
    notePlaceholder: "VIN issue, mismatch, or tamper signs?",
  },
  {
    id: 25,
    section: "Documentation",
    title: "Test Drive",
    instructions:
      "Drive it properly if the seller allows it. Listen for rattles, watch how it shifts, brakes, tracks straight, and handles bumps. Feel for steering play, brake fade on long stops, and smooth transmission shift quality.",
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
