/**
 * 画像ファイルを使わず、コードで生成する水彩風の葉っぱ背景。
 *
 * 決まったシードの疑似乱数で葉の位置・角度・色を決めるため、
 * サーバーとクライアントで必ず同じ結果になる（ハイドレーション不一致が起きない）。
 */

/** mulberry32: 小さな決定論的疑似乱数。 */
function createRandom(seed: number) {
  let t = seed;
  return () => {
    t += 0x6d2b79f5;
    let x = Math.imul(t ^ (t >>> 15), 1 | t);
    x ^= x + Math.imul(x ^ (x >>> 7), 61 | x);
    return ((x ^ (x >>> 14)) >>> 0) / 4294967296;
  };
}

/** 葉 1 枚ぶんのアーモンド型のパス。 */
const LEAF = "M0 0 Q13 -13 0 -34 Q-13 -13 0 0 Z";

const VIEW_W = 1200;
const VIEW_H = 760;

type Layer = {
  count: number;
  blur: number;
  scale: [number, number];
  opacity: [number, number];
  colors: string[];
};

/** 奥（暗くぼかす）から手前（明るく細かい）へ 3 層重ねる。 */
const LAYERS: Layer[] = [
  {
    count: 44,
    blur: 16,
    scale: [3.0, 5.0],
    opacity: [0.7, 0.95],
    colors: ["#3b7a1c", "#2f6a18", "#468a22", "#54992a", "#265c14"],
  },
  {
    count: 104,
    blur: 5,
    scale: [1.4, 2.8],
    opacity: [0.6, 0.9],
    colors: ["#6cae2c", "#7bb937", "#86c53c", "#5ea228", "#95c93f"],
  },
  {
    count: 168,
    blur: 1.2,
    scale: [0.55, 1.5],
    opacity: [0.6, 0.95],
    colors: ["#b3dc58", "#c9e97a", "#a6d74c", "#d8f094", "#93cd47", "#e2f4a6"],
  },
];

export function FoliageBackground() {
  const random = createRandom(20260923);

  const layers = LAYERS.map((layer, layerIndex) => {
    const rosettes = Array.from({ length: layer.count }, (_, i) => {
      // 丸く密集した茂みと、細長く伸びた枝を混ぜて単調さをなくす
      const bushy = random() < 0.45;
      const petals = bushy
        ? 7 + Math.floor(random() * 5)
        : 2 + Math.floor(random() * 4);
      const scale =
        layer.scale[0] + random() * (layer.scale[1] - layer.scale[0]);
      return {
        key: `${layerIndex}-${i}`,
        x: random() * VIEW_W,
        y: random() * VIEW_H,
        rotate: random() * 360,
        scale,
        opacity:
          layer.opacity[0] + random() * (layer.opacity[1] - layer.opacity[0]),
        color: layer.colors[Math.floor(random() * layer.colors.length)],
        petals: Array.from({ length: petals }, (_, k) => ({
          key: k,
          angle: (360 / petals) * k + random() * 40 - 20,
          // 中心から少し離して生やすと、放射状の星ではなく茂みに見える
          offset: random() * (bushy ? 9 : 18),
          length: bushy ? 0.32 + random() * 0.3 : 0.7 + random() * 0.9,
          width: bushy ? 1.1 + random() * 0.8 : 0.6 + random() * 0.6,
        })),
      };
    });

    return { layerIndex, blur: layer.blur, rosettes };
  });

  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 overflow-hidden">
      <svg
        className="h-full w-full"
        viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
        preserveAspectRatio="xMidYMid slice"
      >
        <defs>
          <linearGradient id="foliage-base" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#bfe24f" />
            <stop offset="45%" stopColor="#79b82c" />
            <stop offset="100%" stopColor="#3d7d1c" />
          </linearGradient>
          <radialGradient id="foliage-glow" cx="0.3" cy="0.2" r="0.8">
            <stop offset="0%" stopColor="#dcf28e" stopOpacity="0.55" />
            <stop offset="100%" stopColor="#e4f5a2" stopOpacity="0" />
          </radialGradient>
          {LAYERS.map((layer, i) => (
            <filter
              key={i}
              id={`foliage-blur-${i}`}
              x="-20%"
              y="-20%"
              width="140%"
              height="140%"
            >
              <feGaussianBlur stdDeviation={layer.blur} />
            </filter>
          ))}
        </defs>

        <rect width={VIEW_W} height={VIEW_H} fill="url(#foliage-base)" />
        <rect width={VIEW_W} height={VIEW_H} fill="url(#foliage-glow)" />

        {layers.map(({ layerIndex, rosettes }) => (
          <g key={layerIndex} filter={`url(#foliage-blur-${layerIndex})`}>
            {rosettes.map((r) => (
              <g
                key={r.key}
                transform={`translate(${r.x.toFixed(1)} ${r.y.toFixed(1)}) rotate(${r.rotate.toFixed(0)}) scale(${r.scale.toFixed(2)})`}
                fill={r.color}
                opacity={r.opacity.toFixed(2)}
              >
                {r.petals.map((p) => (
                  <path
                    key={p.key}
                    d={LEAF}
                    transform={`rotate(${p.angle.toFixed(0)}) translate(0 ${-p.offset.toFixed(1)}) scale(${p.width.toFixed(2)} ${p.length.toFixed(2)})`}
                  />
                ))}
              </g>
            ))}
          </g>
        ))}
      </svg>

      {/* 本文の可読性を確保するための薄いクリームのベール */}
      <div className="absolute inset-0 bg-surface-container-low/18" />
    </div>
  );
}
