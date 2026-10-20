import type { CaseBlock, CaseTier, FigureSize } from "../../lib/works";
import { asset } from "../../lib/utils";
import { ARROW_DOWN, PixelIcon } from "./PixelIcon";

/**
 * 项目档案的内容块渲染。
 *
 * 每个 `kind` 对应一种版式，都只负责「长什么样」，内容全在 `works.ts` 里 ——
 * 所以加一个项目的档案不用碰这个文件，只有新块型才需要改这里。
 */
export function CaseBlocks({ blocks }: { blocks: CaseBlock[] }) {
  return (
    <>
      {blocks.map((block, i) => (
        <CaseBlockView key={i} block={block} />
      ))}
    </>
  );
}

function CaseBlockView({ block }: { block: CaseBlock }) {
  switch (block.kind) {
    case "text":
      return <CaseParagraphs body={block.body} />;
    case "points":
      return <CasePoints items={block.items} />;
    case "choices":
      return <CaseChoices items={block.items} />;
    case "figures":
      return <CaseFigures items={block.items} />;
    case "code":
      return <CaseCode title={block.title} body={block.body} />;
    case "arch":
      return <CaseArch caption={block.caption} tiers={block.tiers} />;
  }
}

/** 段落：和文章正文一样按空行切段 */
function CaseParagraphs({ body }: { body: string }) {
  const paragraphs = body.split("\n\n").filter(Boolean);

  return (
    <>
      {paragraphs.map((text, i) => (
        <p key={i} className="text-[14px] leading-[26px] text-foreground/72">
          {text}
        </p>
      ))}
    </>
  );
}

/** 小卡片网格：需求、实现要点、反思都用它 */
function CasePoints({ items }: { items: { title: string; body: string }[] }) {
  return (
    <div className="grid gap-2.5 sm:grid-cols-2">
      {items.map((item) => (
        <div
          key={item.title}
          className="relative border border-cyan-200/20 bg-[#03080f]/50 px-3.5 py-3"
        >
          <span
            aria-hidden="true"
            className="absolute left-0 top-0 h-full w-[2px] bg-primary/45"
          />
          <h4 className="font-pixel text-[14px] leading-[20px] text-primary/90">
            {item.title}
          </h4>
          <p className="mt-1.5 text-[12.5px] leading-[21px] text-foreground/60">{item.body}</p>
        </div>
      ))}
    </div>
  );
}

/**
 * 选型对照：主选方案一行，理由一段，「没选的那条路」压暗收在下面。
 * 用左灰右亮的对比，读起来像在做减法而不是列清单。
 */
function CaseChoices({ items }: { items: { pick: string; why: string; alt?: string }[] }) {
  return (
    <ul className="space-y-px border border-cyan-200/20 bg-cyan-200/10">
      {items.map((item) => (
        <li key={item.pick} className="bg-[#04101a] px-3.5 py-3.5 sm:px-4">
          <div className="flex flex-col gap-1.5 sm:flex-row sm:gap-4">
            <span className="font-pixel shrink-0 text-[14px] leading-[20px] text-primary sm:w-[168px]">
              {item.pick}
            </span>
            <p className="flex-1 text-[12.5px] leading-[21px] text-foreground/65">{item.why}</p>
          </div>
          {item.alt && (
            <p className="mt-2 flex gap-2 text-[12px] leading-[19px] text-cyan-100/35">
              <span className="font-pixel shrink-0 text-cyan-100/25">没有选</span>
              <span className="flex-1">{item.alt}</span>
            </p>
          )}
        </li>
      ))}
    </ul>
  );
}

/**
 * 截图：一张通栏、两张并排。
 *
 * - 通栏不裁切，保持原比例（界面截图裁了就少一块）；
 * - 并排时两栏等高，用 `aspect-[7/9]` + `object-top` 对齐 —— 否则两张图差几十像素，
 *   下面的说明文字跟着错位，看着像没对齐的相册；
 * - 单图按 `size` 收窄：`square` 400 / `compact` 560，方形和配角截图通栏都会占掉半屏。
 */
function CaseFigures({ items }: { items: { src: string; caption: string; size?: FigureSize }[] }) {
  const paired = items.length > 1;

  return (
    <div className={paired ? "grid items-start gap-3 sm:grid-cols-2" : ""}>
      {items.map((item) => (
        <figure key={item.src} className={paired ? "" : SINGLE_WIDTH[item.size ?? "wide"]}>
          <div
            className={[
              "relative overflow-hidden border-2 border-cyan-200/30 bg-[#03080f]",
              paired ? "aspect-[7/9]" : "",
            ].join(" ")}
          >
            <img
              src={asset(item.src)}
              alt={item.caption}
              loading="lazy"
              decoding="async"
              className={[
                "block w-full",
                paired ? "h-full object-cover object-top" : "h-auto",
              ].join(" ")}
            />
            {/* 四角像素标记，和卡片上的同一套语言 */}
            <span aria-hidden="true" className="absolute left-1 top-1 h-1.5 w-1.5 bg-primary/60" />
            <span aria-hidden="true" className="absolute right-1 top-1 h-1.5 w-1.5 bg-primary/60" />
          </div>
          <figcaption className="mt-2 flex gap-2 text-[12px] leading-[19px] text-cyan-100/40">
            <span className="font-pixel shrink-0 text-primary/60">▲</span>
            <span className="flex-1">{item.caption}</span>
          </figcaption>
        </figure>
      ))}
    </div>
  );
}

/** 单图的宽度档位：通栏 / 680 / 400，居中 */
const SINGLE_WIDTH = {
  wide: "",
  compact: "mx-auto w-full max-w-[680px]",
  square: "mx-auto w-full max-w-[400px]",
} as const;

/**
 * 代码 / 协议样例。
 * 不加语法高亮 —— 这块内容都是配置和事件格式，纯等宽就够，
 * 上高亮反而要多带一个依赖。
 */
function CaseCode({ title, body }: { title?: string; body: string }) {
  return (
    <div className="border border-cyan-200/25 bg-[#02080e]/85">
      {title && (
        <div className="flex items-center gap-2 border-b border-cyan-200/15 px-3 py-1.5">
          <span aria-hidden="true" className="h-1.5 w-1.5 bg-cyan-200/40" />
          <span className="font-pixel text-[11px] leading-[16px] text-cyan-100/45">{title}</span>
        </div>
      )}
      <pre className="overflow-x-auto whitespace-pre-wrap break-words px-3.5 py-3 text-[12px] leading-[20px] text-cyan-100/70 sm:whitespace-pre">
        <code className="font-mono">{body}</code>
      </pre>
    </div>
  );
}

/**
 * 分层架构图。
 *
 * 每层一行：左边是层名（前端 / Java 后端 / …），右边是节点方块，
 * 层与层之间一个像素箭头。窄屏上层名折到节点上面，不然一行放不下。
 */
function CaseArch({ caption, tiers }: { caption?: string; tiers: CaseTier[] }) {
  return (
    <figure className="border-2 border-cyan-200/25 bg-[#03080f]/70 p-3.5 sm:p-4">
      {caption && (
        <figcaption className="font-pixel mb-3.5 text-[11.5px] leading-[19px] text-cyan-100/40">
          {caption}
        </figcaption>
      )}

      {tiers.map((tier, i) => (
        <div key={tier.label}>
          <div className="flex flex-col gap-2 sm:flex-row sm:gap-2.5">
            <div className="font-pixel flex shrink-0 items-center justify-center whitespace-nowrap border border-cyan-200/25 bg-cyan-300/[0.07] px-2.5 py-1.5 text-[12px] leading-[16px] text-primary/85 sm:w-[104px] sm:py-0">
              {tier.label}
            </div>
            <div className="flex flex-1 flex-wrap gap-2">
              {tier.nodes.map((node) => (
                <div
                  key={node.name}
                  className="min-w-[96px] flex-1 border border-cyan-200/20 bg-[#061520]/75 px-2.5 py-2"
                >
                  <div className="font-pixel text-[12.5px] leading-[17px] text-foreground/85">
                    {node.name}
                  </div>
                  {node.note && (
                    <div className="mt-0.5 text-[11px] leading-[15px] text-cyan-100/35">
                      {node.note}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {i < tiers.length - 1 && (
            <div className="flex justify-center py-1.5">
              <PixelIcon pattern={ARROW_DOWN} className="h-3 w-3 text-cyan-200/25" />
            </div>
          )}
        </div>
      ))}
    </figure>
  );
}
