"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { PhoneCall } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import SectionHeading from "@/components/SectionHeading";
import { useLanguage } from "@/context/LanguageContext";

function FAQ() {
  const { t } = useLanguage();
  const faq = t.homePage.faq;

  const faqs = [
    { q: faq.q1, a: faq.a1 },
    { q: faq.q2, a: faq.a2 },
    { q: faq.q3, a: faq.a3 },
    { q: faq.q4, a: faq.a4 },
    { q: faq.q5, a: faq.a5 },
    { q: faq.q6, a: faq.a6 },
    { q: faq.q7, a: faq.a7 },
    { q: faq.q8, a: faq.a8 },
  ];

  return (
    <section className="w-full py-24 md:py-32">
      <div className="container-max">
        <div className="grid gap-12 lg:grid-cols-2 lg:gap-10">
          <div className="flex flex-col gap-8 self-start lg:sticky lg:top-28">
            <SectionHeading
              badge={faq.badge}
              align="left"
              title={faq.title}
              subtitle={faq.sub}
            />
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.25 }}
            >
              <Button asChild variant="outline" className="gap-3">
                <Link href="/about#contact">
                  {faq.cta} <PhoneCall className="h-4 w-4" aria-hidden="true" />
                </Link>
              </Button>
            </motion.div>
          </div>

          <Accordion type="single" collapsible className="w-full">
            {faqs.map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ duration: 0.45, delay: index * 0.05, ease: "easeOut" }}
              >
                <AccordionItem value={"index-" + index} className="border-border">
                  <AccordionTrigger className="gap-4 py-5 text-left text-lg font-semibold transition-colors hover:no-underline hover:text-signal md:text-xl [&[data-state=open]]:text-signal">
                    <span className="flex items-baseline gap-4">
                      <span className="shrink-0 font-mono text-[11px] tracking-[0.18em] text-signal/60">
                        {String(index + 1).padStart(2, "0")}
                      </span>
                      {item.q}
                    </span>
                  </AccordionTrigger>
                  <AccordionContent className="pb-6 pl-10 text-base leading-relaxed text-muted-foreground md:text-lg">
                    {item.a}
                  </AccordionContent>
                </AccordionItem>
              </motion.div>
            ))}
          </Accordion>
        </div>
      </div>
    </section>
  );
}

export { FAQ };
