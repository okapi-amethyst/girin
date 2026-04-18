// サンプルコンボデータ（PROMPT_COMBO_DATA.md 準拠）
// ペアページ表示確認用のダミーデータ

export type Starter = "ground" | "anti_air" | "pressure_mixup" | "tag_launcher";
export type Tag =
  | "oki"
  | "corner_carry"
  | "side_switch"
  | "throw"
  | "counter_hit"
  | "fury"
  | "hkd"
  | "limit_strike"
  | "punish"
  | "to_tag_launcher";

export interface ComboData {
  id: number;
  point_character: number; // キャラマスターID
  assist_character: number | null;
  fuse: string;
  starter: Starter;
  position: string;
  duo_only: boolean;
  tag: boolean;
  pulse: boolean;
  assist_used: boolean;
  ult_gauge_point: number;
  ult_gauge_assist: number;
  title?: string;
  game_version?: string;
  inputs: string;
  damage: number;
  tags: Tag[];
  difficulty: number;
  video_url: string;
  submitter_name: string;
  notes?: string;
  recommended?: boolean;
}

// Ahri(1) × Yasuo(12) のサンプルコンボ
export const sampleCombos: ComboData[] = [
  {
    id: 1,
    point_character: 1,
    assist_character: null,
    fuse: "No Fuse",
    starter: "ground",
    position: "no_limit",
    duo_only: false,
    tag: false,
    pulse: true,
    assist_used: false,
    ult_gauge_point: 1,
    ult_gauge_assist: 0,
    title: "M連打パルス（ゲージ1本）",
    game_version: "v1.1.5",
    inputs: "M > M > M > M",
    damage: 349,
    tags: [],
    difficulty: 1,
    video_url: "https://youtu.be/T8H_tluMRPA",
    submitter_name: "GIRINテスト",
    notes: "M連打パルスコンボ。1ゲージ使用。",
    recommended: true,
  },
  {
    id: 2,
    point_character: 5,
    assist_character: null,
    fuse: "No Fuse",
    starter: "ground",
    position: "center",
    duo_only: false,
    tag: false,
    pulse: true,
    assist_used: false,
    ult_gauge_point: 1,
    ult_gauge_assist: 0,
    title: "ダリウスパルス改良",
    game_version: "v1.1.5",
    inputs: "M > M > 6S2 , M > M > M > M > M",
    damage: 529,
    tags: ["oki"],
    difficulty: 2,
    video_url: "https://youtube.com/watch?v=example2&t=15",
    submitter_name: "GIRINテスト",
    notes: "M>M>6S2まで入れ込んで6S2の斧を振り終わったらM連打でS2スーパーまででる。",
    recommended: true,
  },
  {
    id: 3,
    point_character: 5,
    assist_character: 7,
    fuse: "Double Down",
    starter: "ground",
    position: "no_limit",
    duo_only: false,
    tag: true,
    pulse: false,
    assist_used: true,
    ult_gauge_point: 3,
    ult_gauge_assist: 1,
    title: "DD3-1ゲージコンボ",
    game_version: "v1.1.5",
    inputs: "M > 2M > H > 6S2 > M > H > 6S2~6S2 > 6T > 2S1 > T > M > H > j.9M > j.H > j.S1 > H > 2T > j.M > j.H > j.S2 > L+S1 > S1+S2",
    damage: 921,
    tags: ["side_switch", "corner_carry"],
    difficulty: 4,
    video_url: "https://youtube.com/watch?v=example3&t=45",
    submitter_name: "GIRINテスト",
    notes: "出血触手付きイラオイ〆",
  },
  {
    id: 4,
    point_character: 7,
    assist_character: null,
    fuse: "No Fuse",
    starter: "ground",
    position: "corner",
    duo_only: false,
    tag: false,
    pulse: false,
    assist_used: false,
    ult_gauge_point: 0,
    ult_gauge_assist: 0,
    title: "CORNER 2 TENTACLE SETUP",
    game_version: "v1.1.5",
    inputs: "2L > M > H > 2S2 > dl.M > H > 2H > 9 > j.L > j.L > j.L > j.L > j.S2 > H > 2S1 > 2H > 9 > j.M > j.S2",
    damage: 495,
    tags: ["oki", "hkd"],
    difficulty: 4,
    video_url: "https://youtube.com/watch?v=example4&t=60",
    submitter_name: "GIRINテスト",
    notes: "タグは後で消す",
  },
  {
    id: 5,
    point_character: 5,
    assist_character: 7,
    fuse: "2X Assist",
    starter: "ground",
    position: "no_limit",
    duo_only: false,
    tag: true,
    pulse: false,
    assist_used: true,
    ult_gauge_point: 1,
    ult_gauge_assist: 1,
    inputs: "M > 2M > H > 3H > 6S2 > 6T > 2S1 > 4T > S2+L > S1 > T > M > H > 2H > j.9M > j.H > j.S2 > S1+L",
    damage: 781,
    tags: ["side_switch", "oki", "corner_carry", "limit_strike", "counter_hit"],
    difficulty: 5,
    video_url: "https://youtube.com/watch?v=example5&t=90",
    submitter_name: "GIRINテスト",
    notes: "出血触手付きイラオイ〆",
  },
];
