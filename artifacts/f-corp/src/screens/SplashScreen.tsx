import { motion } from 'framer-motion';

export default function SplashScreen() {
  return (
    <motion.div
      style={{
        position: 'absolute', inset: 0,
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        background: '#E8EDE8', zIndex: 50,
      }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, y: -20, transition: { duration: 0.5, ease: 'easeInOut' } }}
    >
      <motion.div
        initial={{ scale: 0.92, opacity: 0, filter: 'blur(8px)' }}
        animate={{ scale: 1, opacity: 1, filter: 'blur(0px)' }}
        transition={{ duration: 1.0, ease: 'easeOut' }}
        style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}
      >
        {/* Logo badge */}
        <div style={{
          width: 72, height: 72, borderRadius: 22,
          background: 'linear-gradient(135deg, #0fd4a8 0%, #0ba888 100%)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 8px 32px rgba(15,212,168,0.35)',
          marginBottom: 8,
        }}>
          <span style={{ fontSize: 26, fontWeight: 900, color: '#065f46', fontFamily: 'Inter,sans-serif', letterSpacing: -1 }}>
            FC
          </span>
        </div>

        <h1 style={{
          fontSize: 48, fontWeight: 900, letterSpacing: -2.5,
          color: '#111827', fontFamily: 'Inter,sans-serif',
          lineHeight: 1,
        }}>
          F-CORP
        </h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7, duration: 0.8 }}
          style={{
            fontSize: 11, letterSpacing: 4,
            color: '#9ca3af', textTransform: 'uppercase',
            fontFamily: 'Inter,sans-serif', fontWeight: 500,
          }}
        >
          Football Corporation
        </motion.p>
      </motion.div>

      {/* Loading dots */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2 }}
        style={{ position: 'absolute', bottom: 60, display: 'flex', gap: 6 }}
      >
        {[0, 1, 2].map(i => (
          <motion.div
            key={i}
            animate={{ opacity: [0.3, 1, 0.3], scale: [0.8, 1, 0.8] }}
            transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.2 }}
            style={{ width: 6, height: 6, borderRadius: '50%', background: '#0fd4a8' }}
          />
        ))}
      </motion.div>
    </motion.div>
  );
}
