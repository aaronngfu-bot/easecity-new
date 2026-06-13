"use client";
import { TestimonialsColumn } from "@/components/ui/testimonials-column";
import { motion } from "motion/react";

const testimonials = [
  {
    text: "easecity 的串流控制系統讓我們整棟商廈的設備管理省了七成人手，部署當日就上線，沒有想像中的陣痛期。",
    image: "https://i.pravatar.cc/80?img=12",
    name: "陳先生",
    role: "中環商廈・設施總監",
  },
  {
    text: "從感測器到後台儀表板都是同一套系統，再不用串七八個供應商。香港團隊溝通快，問題當日就有人到場。",
    image: "https://i.pravatar.cc/80?img=33",
    name: "Wong, K.",
    role: "Facility IT Manager",
  },
  {
    text: "我們需要的不是一個 demo，而是真的能跑十年的基建。easecity 的硬件規格和文檔水平讓工程部完全放心。",
    image: "https://i.pravatar.cc/80?img=47",
    name: "李工程師",
    role: "系統整合商・項目經理",
  },
  {
    text: "Scale 起來毫無壓力，從一個樓層擴到八個分點，配置幾乎是 copy & paste，這就是我們選擇 easecity 的原因。",
    image: "https://i.pravatar.cc/80?img=68",
    name: "Sarah L.",
    role: "Head of Operations, Retail Group",
  },
  {
    text: "做過幾個智能化項目，最頭痛是 vendor lock-in。easecity 用開放協議，將來換零件、換廠商都不會被綁。",
    image: "https://i.pravatar.cc/80?img=15",
    name: "Marcus T.",
    role: "Smart Building Consultant",
  },
  {
    text: "凌晨兩點警報觸發，遠端就能定位到問題模組，第二朝開門前已經修好。這套監控真係救命。",
    image: "https://i.pravatar.cc/80?img=51",
    name: "張小姐",
    role: "酒店集團・物業管理",
  },
  {
    text: "在地製造這點對我們很重要，零件供應、保養維修都不用等三個月貨運。Made in Hong Kong 真的有差。",
    image: "https://i.pravatar.cc/80?img=23",
    name: "Daniel C.",
    role: "工業大廈業主",
  },
  {
    text: "由提案、佈線到上線只用了六週，比原本估的時間快一半。文檔交接齊全，後續團隊接手零摩擦。",
    image: "https://i.pravatar.cc/80?img=39",
    name: "Priya S.",
    role: "Engineering Lead, Logistics Co.",
  },
  {
    text: "之前用海外品牌，每次小改動都要等遠端工程師。本地團隊的反應速度根本不是同一個量級。",
    image: "https://i.pravatar.cc/80?img=56",
    name: "Kevin H.",
    role: "Property Tech Director",
  },
];

const firstColumn = testimonials.slice(0, 3);
const secondColumn = testimonials.slice(3, 6);
const thirdColumn = testimonials.slice(6, 9);

export default function TestimonialsSection() {
  return (
    <section className="relative bg-[#050505] py-24 overflow-hidden">
      {/* 背景微光 */}
      <div
        className="absolute inset-0 pointer-events-none opacity-40"
        style={{
          background:
            "radial-gradient(ellipse 800px 400px at 50% 0%, rgba(94,234,212,0.08), transparent 70%)",
        }}
        aria-hidden
      />

      <div className="container mx-auto px-4 z-10 relative">
        {/* 標題區 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="flex flex-col items-center justify-center max-w-2xl mx-auto"
        >
          <div className="flex items-center gap-3 text-xs tracking-[0.3em] text-teal-400/80 mb-6">
            <span className="w-8 h-px bg-teal-400/40" />
            <span>§ TESTIMONIALS</span>
            <span className="w-8 h-px bg-teal-400/40" />
          </div>

          <h2 className="text-4xl md:text-5xl font-bold text-center tracking-tight text-white">
            工程團隊與業主，
            <span className="text-teal-400">都選 easecity</span>
          </h2>
          <p className="text-center mt-5 text-neutral-400 leading-relaxed">
            從中環商廈到工業基建，easecity 的串流控制系統，
            正在成為香港智能化項目的預設選擇。
          </p>
        </motion.div>

        {/* 三欄滾動 */}
        <div className="flex justify-center gap-6 mt-14 [mask-image:linear-gradient(to_bottom,transparent,black_15%,black_85%,transparent)] max-h-[640px] overflow-hidden">
          <TestimonialsColumn testimonials={firstColumn} duration={18} />
          <TestimonialsColumn
            testimonials={secondColumn}
            className="hidden md:block"
            duration={22}
          />
          <TestimonialsColumn
            testimonials={thirdColumn}
            className="hidden lg:block"
            duration={20}
          />
        </div>
      </div>
    </section>
  );
}
