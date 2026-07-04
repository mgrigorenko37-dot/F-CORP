import { motion } from 'framer-motion';

export default function SplashScreen() {
  return (
    <motion.div 
      className="absolute inset-0 flex flex-col items-center justify-center bg-background z-50"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, y: -20, transition: { duration: 0.5, ease: "easeInOut" } }}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0, filter: 'blur(10px)' }}
        animate={{ scale: 1, opacity: 1, filter: 'blur(0px)' }}
        transition={{ duration: 1.2, ease: "easeOut" }}
        className="flex flex-col items-center"
      >
        <h1 className="text-6xl font-display font-bold tracking-tighter text-white mb-2">
          F-CORP
        </h1>
        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8, duration: 1 }}
          className="text-[10px] font-sans tracking-[0.3em] text-muted-foreground uppercase"
        >
          Football Corporation
        </motion.p>
      </motion.div>
      
      {/* Decorative scanning line */}
      <motion.div
        initial={{ top: '0%', opacity: 0 }}
        animate={{ top: '100%', opacity: [0, 0.2, 0] }}
        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
        className="absolute w-full h-[2px] bg-primary left-0 pointer-events-none"
      />
    </motion.div>
  );
}
