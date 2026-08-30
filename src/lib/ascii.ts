/* Hand-set ASCII artwork. Monospace-safe: box drawing + pure ASCII only. */

export const PIPELINE = String.raw`
 ┌───────────────────────┐
 │ INPUT   · 40k docs    │
 └───────────┬───────────┘
             ▼
 ┌───────────────────────┐
 │ EMBED   · bge-small   │
 └───────────┬───────────┘
             ▼
 ┌───────────────────────┐
 │ RETRIEVE· faiss ivf   │
 └───────────┬───────────┘
             ▼
 ┌───────────────────────┐
 │ GENERATE· llama-3.1   │
 └───────────┬───────────┘
             ▼
      [ grounded answer ]`;

export const ROBOT = String.raw`
      .___________.
      |  _______  |
      | | o   o | |
      | |   -   | |
      |_|_______|_|
        |  ___  |
    ====|_|   |_|_====
        |_________|
         _|     |_
        |__|   |__|`;

export const CHIP = String.raw`
 ──┬──┬────────┬──┬──
   │  │ ▚▚▚▚▚▚ │  │
 ──┴──┴────────┴──┴──
      rahul/ai`;

export const NET_SMALL = String.raw`
  x1 ──▶ h1 ──▶ h3 ──▶ y
  x2 ──▶ h2 ──▶ h4 ──▶ y
        σ(w·x + b)`;

export const LAB_FRAME = String.raw`
 ┌──────────────────────────────────┐
 │ AI_LAB / EXPERIMENT_XXX          │
 │                                  │
 │ TITLE_GOES_HERE                  │
 │                                  │
 │ Model      : .....               │
 │ Stack      : .....               │
 │ Status     : ● EXPERIMENTAL      │
 └──────────────────────────────────┘`;

export const MARGIN_SNIPPETS = [
  "∇ loss.backward()",
  ">> torch.cuda.is_available()",
  "[0.21, 0.04, 0.93]",
  "git commit -m 'ship it'",
  "SELECT insight FROM data",
  "epoch 12/20 ▓▓▓▓▓░░░",
  "faiss.IndexFlatIP(768)",
  "λ learning_rate = 3e-4",
];

const SPARK = "▁▂▃▄▅▆▇█";

/** Generates a shifting loss-curve sparkline row for terminal animations. */
export function sparkRow(offset: number, width = 26): string {
  let out = "";
  for (let i = 0; i < width; i++) {
    const v = Math.abs(Math.sin((i + offset) * 0.55)) * (1 - (i / width) * 0.55);
    out += SPARK[Math.min(SPARK.length - 1, Math.round(v * (SPARK.length - 1)))];
  }
  return out;
}

/** Classic name banner. */
export const NAME_BANNER = String.raw`
   ____        _           _       _    ___
  |  _ \  __ _| |__  _   _| |     / \  |_ _|
  | |_) |/ _` + "`" + String.raw` | '_ \| | | | |    / _ \  | |
  |  _ < (_| | | | | |_| | |___/ ___ \ | |
  |_| \_\__,_|_| |_|\__,_|_____/_/   \_\___|`;
