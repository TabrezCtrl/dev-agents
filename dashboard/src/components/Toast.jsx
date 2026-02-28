const style = {
  position: 'fixed',
  bottom: 24,
  right: 24,
  padding: '10px 20px',
  borderRadius: 8,
  fontSize: 13,
  fontWeight: 500,
  color: '#fff',
  zIndex: 200,
  animation: 'fadeInOut 2.5s ease forwards',
};

export default function Toast({ msg, isError }) {
  return (
    <>
      <style>{`
        @keyframes fadeInOut {
          0% { opacity: 0; transform: translateY(10px); }
          15% { opacity: 1; transform: translateY(0); }
          85% { opacity: 1; transform: translateY(0); }
          100% { opacity: 0; transform: translateY(10px); }
        }
      `}</style>
      <div style={{ ...style, background: isError ? 'var(--danger)' : 'var(--success)' }}>
        {msg}
      </div>
    </>
  );
}
