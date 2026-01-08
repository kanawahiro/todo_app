export const styles = {
  container: {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
    fontFamily: 'sans-serif',
    color: '#e8e8e8'
  },
  header: {
    padding: '20px 24px',
    borderBottom: '1px solid rgba(255,255,255,0.1)'
  },
  title: {
    fontSize: '1.5rem',
    fontWeight: 'bold',
    margin: 0,
    color: '#00d4ff'
  },
  tabNav: {
    display: 'flex',
    gap: '4px',
    padding: '12px 24px',
    borderBottom: '1px solid rgba(255,255,255,0.1)',
    flexWrap: 'wrap'
  },
  tabBtn: {
    padding: '10px 20px',
    border: 'none',
    borderRadius: '8px',
    background: 'transparent',
    color: '#888',
    cursor: 'pointer',
    fontSize: '0.9rem'
  },
  tabBtnActive: {
    background: 'rgba(0,212,255,0.15)',
    color: '#00d4ff'
  },
  main: {
    padding: '20px 24px'
  },
  btn: {
    padding: '12px 24px',
    borderRadius: '8px',
    border: 'none',
    background: 'linear-gradient(90deg, #00d4ff, #7b2cbf)',
    color: '#fff',
    fontWeight: 'bold',
    cursor: 'pointer',
    marginTop: '12px'
  },
  input: {
    padding: '10px 12px',
    borderRadius: '8px',
    border: '1px solid rgba(255,255,255,0.2)',
    background: 'rgba(255,255,255,0.05)',
    color: '#e8e8e8',
    fontSize: '1rem',
    width: '100%',
    boxSizing: 'border-box'
  },
  textarea: {
    padding: '12px',
    borderRadius: '8px',
    border: '1px solid rgba(255,255,255,0.2)',
    background: 'rgba(255,255,255,0.05)',
    color: '#e8e8e8',
    fontSize: '1rem',
    width: '100%',
    minHeight: '100px',
    boxSizing: 'border-box',
    resize: 'vertical'
  },
  card: {
    background: 'rgba(255,255,255,0.05)',
    borderRadius: '10px',
    padding: '14px',
    marginBottom: '12px',
    borderLeft: '4px solid'
  },
  actionBtn: {
    padding: '6px 12px',
    borderRadius: '6px',
    border: '1px solid rgba(255,255,255,0.2)',
    background: 'rgba(255,255,255,0.05)',
    color: '#ccc',
    cursor: 'pointer',
    fontSize: '0.8rem',
    marginRight: '6px',
    marginBottom: '6px'
  },
  deleteBtn: {
    padding: '6px 12px',
    borderRadius: '6px',
    border: '1px solid #ef4444',
    background: 'rgba(239,68,68,0.1)',
    color: '#ef4444',
    cursor: 'pointer',
    fontSize: '0.8rem'
  },
  overlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'rgba(0,0,0,0.7)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000
  },
  dialog: {
    background: '#1a1a2e',
    borderRadius: '16px',
    padding: '24px',
    maxWidth: '400px',
    width: '90%'
  },
  chip: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
    padding: '6px 12px',
    borderRadius: '20px',
    background: 'rgba(0,212,255,0.15)',
    color: '#00d4ff',
    fontSize: '0.85rem',
    marginRight: '8px',
    marginBottom: '8px'
  },
  column: {
    minWidth: '280px',
    maxWidth: '320px',
    background: 'rgba(255,255,255,0.03)',
    borderRadius: '12px',
    padding: '16px',
    marginRight: '16px',
    marginBottom: '16px'
  },
  error: {
    background: 'rgba(239,68,68,0.1)',
    border: '1px solid #ef4444',
    borderRadius: '8px',
    padding: '12px',
    color: '#ef4444',
    marginBottom: '12px'
  },
  timeInput: {
    padding: '6px 8px',
    borderRadius: '6px',
    border: '1px solid rgba(255,255,255,0.2)',
    background: 'rgba(255,255,255,0.05)',
    color: '#e8e8e8',
    fontSize: '0.9rem',
    width: '90px',
    textAlign: 'center'
  },
  timeInputError: {
    borderColor: '#ef4444',
    background: 'rgba(239,68,68,0.1)'
  },
  sessionItem: {
    background: 'rgba(0,0,0,0.2)',
    borderRadius: '8px',
    padding: '10px 12px',
    marginBottom: '8px'
  },
  sessionDeleteBtn: {
    padding: '4px 8px',
    borderRadius: '4px',
    border: '1px solid #ef4444',
    background: 'transparent',
    color: '#ef4444',
    cursor: 'pointer',
    fontSize: '0.75rem'
  },
  addSessionBtn: {
    padding: '8px 16px',
    borderRadius: '6px',
    border: '1px dashed rgba(255,255,255,0.3)',
    background: 'transparent',
    color: '#888',
    cursor: 'pointer',
    fontSize: '0.85rem',
    width: '100%',
    marginTop: '8px'
  }
};
