export interface ChecklistItem {
  id: string;
  label: string;
}

export interface ChecklistSection {
  title: string;
  summary: string;
  items: ChecklistItem[];
}

export const INSPECTION_SECTIONS: ChecklistSection[] = [
  {
    title: "Exterior",
    summary: "Walk-around condition, visible damage, tyres and glass.",
    items: [
      { id: "ext-panels", label: "Panels line up and paint looks consistent" },
      { id: "ext-rust", label: "No visible rust, dents, or scratches" },
      { id: "ext-lights", label: "Lights and indicators all work" },
      { id: "ext-tyres", label: "Tyres look decent and wear evenly" },
      { id: "ext-glass", label: "Windscreen and mirrors aren't damaged" },
    ],
  },
  {
    title: "Interior",
    summary: "Cabin controls, warning lights, trim condition and odours.",
    items: [
      { id: "int-windows", label: "Windows, locks and mirrors work" },
      { id: "int-aircon", label: "Air con blows cold" },
      { id: "int-warnings", label: "No warning lights stay on" },
      { id: "int-seats", label: "Seats, seatbelts and controls work" },
      { id: "int-smell", label: "No water damage, mould or bad smells" },
    ],
  },
  {
    title: "Mechanical",
    summary: "Start-up, driveline feel, braking and obvious leaks.",
    items: [
      { id: "mech-start", label: "Engine starts cleanly, no odd noises" },
      { id: "mech-trans", label: "Transmission shifts smoothly" },
      { id: "mech-brakes", label: "Brakes feel firm, no pulling" },
      { id: "mech-leaks", label: "No fluid leaks visible under the car" },
    ],
  },
  {
    title: "Test Drive",
    summary: "Steering, braking, vibration and behaviour under load.",
    items: [
      { id: "drive-steering", label: "Steering is straight, no vibration" },
      { id: "drive-noises", label: "No unusual noises while driving" },
      { id: "drive-accel", label: "Acceleration and braking feel normal" },
    ],
  },
  {
    title: "Documents",
    summary: "Seller identity, rego, service records, safety certificate and PPSR.",
    items: [
      { id: "docs-rego", label: "Rego matches the car and seller" },
      { id: "docs-service", label: "Service history available" },
      { id: "docs-safety", label: "Safety certificate current or discussed" },
      { id: "docs-ppsr", label: "PPSR check completed" },
    ],
  },
];

export const INSPECTION_ITEMS = INSPECTION_SECTIONS.flatMap((section) => section.items);
export const TOTAL_INSPECTION_CHECKS = INSPECTION_ITEMS.length;
