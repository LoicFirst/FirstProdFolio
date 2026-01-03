'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { HiMail } from 'react-icons/hi';

export default function FloatingContact() {
  return (
    <Link href="/contact">
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 1, type: 'spring', stiffness: 260, damping: 20 }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        className="fixed bottom-8 right-8 z-50 w-14 h-14 bg-primary-500 rounded-full flex items-center justify-center shadow-lg shadow-primary-500/30 cursor-pointer group"
      >
        <HiMail className="w-6 h-6 text-white" />
        
        {/* Tooltip */}
        <div className="absolute right-full mr-3 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
          Me contacter
          <div className="absolute top-1/2 -right-1 -translate-y-1/2 w-2 h-2 bg-gray-900 rotate-45" />
        </div>
        
        {/* Pulse Animation */}
        <span className="absolute inset-0 rounded-full bg-primary-500 animate-ping opacity-25" />
      </motion.div>
    </Link>
  );
}
