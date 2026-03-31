import yasuoData from "./combos/yasuo.json";
import ahriData from "./combos/ahri.json";

export interface Combo {
  tier: number;
  name: string;
  situation: string;
  input: string;
  damage: number;
  difficulty: number;
  note: string;
  essential: boolean;
}

export interface CropData {
  bgSize: string;
  bgPosition: string;
}

export interface Character {
  name: string;
  nameJa: string;
  slug: string;
  combos: Combo[];
  crop?: CropData;
}

// Wiki 180x150 基準のクロップ値。表示時にカードサイズに合わせてスケーリングする
const cropMap: Record<string, CropData> = {
  ahri:       { bgSize: "400px", bgPosition: "-65px -10px" },
  blitzcrank: { bgSize: "500px", bgPosition: "-160px 4px" },
  braum:      { bgSize: "460px", bgPosition: "-190px -44px" },
  caitlyn:    { bgSize: "400px", bgPosition: "-100px 0px" },
  darius:     { bgSize: "540px", bgPosition: "-292px -54px" },
  ekko:       { bgSize: "400px", bgPosition: "-96px -34px" },
  illaoi:     { bgSize: "400px", bgPosition: "-110px -58px" },
  jinx:       { bgSize: "400px", bgPosition: "-52px -60px" },
  teemo:      { bgSize: "260px", bgPosition: "-84px -84px" },
  vi:         { bgSize: "400px", bgPosition: "-86px -10px" },
  warwick:    { bgSize: "400px", bgPosition: "-164px -108px" },
  yasuo:      { bgSize: "540px", bgPosition: "-196px -62px" },
};

function withCrop(char: { name: string; nameJa: string; slug: string; combos: Combo[] }): Character {
  return { ...char, crop: cropMap[char.slug] };
}

export const characters: Character[] = [
  withCrop(ahriData),
  { name: "Akali", nameJa: "アカリ", slug: "akali", combos: [] },
  withCrop({ name: "Blitzcrank", nameJa: "ブリッツクランク", slug: "blitzcrank", combos: [] }),
  withCrop({ name: "Braum", nameJa: "ブラウム", slug: "braum", combos: [] }),
  withCrop({ name: "Caitlyn", nameJa: "ケイトリン", slug: "caitlyn", combos: [] }),
  withCrop({ name: "Darius", nameJa: "ダリウス", slug: "darius", combos: [] }),
  withCrop({ name: "Ekko", nameJa: "エコー", slug: "ekko", combos: [] }),
  withCrop({ name: "Illaoi", nameJa: "イラオイ", slug: "illaoi", combos: [] }),
  withCrop({ name: "Jinx", nameJa: "ジンクス", slug: "jinx", combos: [] }),
  withCrop({ name: "Teemo", nameJa: "ティーモ", slug: "teemo", combos: [] }),
  withCrop({ name: "Vi", nameJa: "ヴァイ", slug: "vi", combos: [] }),
  withCrop({ name: "Warwick", nameJa: "ワーウィック", slug: "warwick", combos: [] }),
  withCrop(yasuoData),
];

export const tiers = [
  { id: 1, label: "これだけコンボ", desc: "ここだけで対戦行ってOK" },
  { id: 2, label: "状況別コンボ", desc: "対戦で困ったら戻ってくる" },
  { id: 3, label: "最適化コンボ", desc: "やり込み勢の遊び場" },
];
