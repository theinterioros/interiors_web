"use client";

import { motion } from "framer-motion";

interface FadeInItemProps {
  children: React.ReactNode;
  className?: string;
}

export default function FadeInItem({ children, className }: FadeInItemProps) {
  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0 },
      }}
      transition={{ duration: 0.4 }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
