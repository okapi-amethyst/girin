// サンプルコンボデータ（PROMPT_COMBO_DATA.md 準拠）
// ペアページ表示確認用のダミーデータ

export interface ComboData {
  id: number;
  point_character: number; // キャラマスターID
  assist_character: number | null;
  fuse: string;
  starter: string;
  position: string;
  duo_only: boolean;
  tag: boolean;
  pulse: boolean;
  assist_used: boolean;
  ult_gauge_point: number;
  ult_gauge_assist: number;
  inputs: string;
  damage: number;
  tags: string[];
  difficulty: number;
  practicality: number; // 自動算出（仮値）
  video_url: string;
  submitter_name: string;
  creator_name?: string;
  notes?: string;
}

// Ahri(1) × Yasuo(12) のサンプルコンボ
export const sampleCombos: ComboData[] = [
  {
    id: 1,
    point_character: 1, // Ahri
    assist_character: 12, // Yasuo
    fuse: "No Fuse",
    starter: "地上ヒット",
    position: "center",
    duo_only: false,
    tag: false,
    pulse: true,
    assist_used: false,
    ult_gauge_point: 1,
    ult_gauge_assist: 0,
    inputs: "5M > 5M > 5M > 5M > Super",
    damage: 2850,
    tags: [],
    difficulty: 1,
    practicality: 95,
    video_url: "https://youtu.be/T8H_tluMRPA",
    submitter_name: "GIRINテスト",
    notes: "まずはこれだけ。M連打パルスコンボ。1ゲージ使用。",
  },
  {
    id: 2,
    point_character: 1,
    assist_character: 12,
    fuse: "No Fuse",
    starter: "地上ヒット",
    position: "center",
    duo_only: false,
    tag: false,
    pulse: true,
    assist_used: false,
    ult_gauge_point: 0,
    ult_gauge_assist: 0,
    inputs: "5L > 5M > 2M > 5H > 236M",
    damage: 3100,
    tags: ["起き攻め可"],
    difficulty: 2,
    practicality: 90,
    video_url: "https://youtube.com/watch?v=example2&t=15",
    submitter_name: "GIRINテスト",
    notes: "パルス使いつつボタンを押し分ける。起き攻めに行ける。",
  },
  {
    id: 3,
    point_character: 1,
    assist_character: 12,
    fuse: "Double Down",
    starter: "地上ヒット",
    position: "center",
    duo_only: true,
    tag: true,
    pulse: false,
    assist_used: true,
    ult_gauge_point: 0,
    ult_gauge_assist: 0,
    inputs: "5L > 5M > 5H > Assist > 66 > Tag > 5M > 5H > 236H",
    damage: 4200,
    tags: ["入替え", "端運び"],
    difficulty: 3,
    practicality: 75,
    video_url: "https://youtube.com/watch?v=example3&t=45",
    submitter_name: "GIRINテスト",
    creator_name: "ProPlayer",
    notes: "タグで交代してヤスオで〆。中央から端に運べる。",
  },
  {
    id: 4,
    point_character: 1,
    assist_character: 12,
    fuse: "Double Down",
    starter: "対空",
    position: "corner",
    duo_only: true,
    tag: false,
    pulse: false,
    assist_used: true,
    ult_gauge_point: 1,
    ult_gauge_assist: 0,
    inputs: "2H > jM > jH > Assist > 5H > 236H > Super",
    damage: 5100,
    tags: ["起き攻め可"],
    difficulty: 4,
    practicality: 50,
    video_url: "https://youtube.com/watch?v=example4&t=60",
    submitter_name: "GIRINテスト",
    notes: "端対空始動。ゲージ1本で高火力。",
  },
  {
    id: 5,
    point_character: 12, // Yasuo point
    assist_character: 1,
    fuse: "Double Down",
    starter: "地上ヒット",
    position: "center",
    duo_only: true,
    tag: true,
    pulse: false,
    assist_used: true,
    ult_gauge_point: 1,
    ult_gauge_assist: 1,
    inputs: "5L > 5M > 236L > Assist > 66 > Tag > 5M > 2H > jH > Super",
    damage: 5800,
    tags: ["入替え", "起き攻め可", "端運び"],
    difficulty: 5,
    practicality: 30,
    video_url: "https://youtube.com/watch?v=example5&t=90",
    submitter_name: "GIRINテスト",
    creator_name: "TopPlayerX",
    notes: "両ゲージ使用の最大コンボ。プロでも成功率低め。",
  },
];
