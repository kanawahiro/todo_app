export const styles = {
  container: {
    minHeight: '100vh',
    background: '#fbf9f4',
    fontFamily: 'sans-serif',
    color: '#2d2c2c'
  },
  header: {
    padding: '20px 24px',
    borderBottom: '1px solid rgba(0,0,0,0.06)'
  },
  title: {
    fontSize: '1.5rem',
    fontWeight: 'bold',
    margin: 0,
    color: '#2d2c2c',
    display: 'flex',
    alignItems: 'center',
    gap: '10px'
  },
  tabNav: {
    display: 'flex',
    gap: '4px',
    padding: '12px 24px',
    borderBottom: '1px solid rgba(0,0,0,0.06)',
    flexWrap: 'wrap',
    background: '#fbf9f4'
  },
  tabBtn: {
    padding: '8px 16px',
    border: 'none',
    borderRadius: '6px',
    background: 'transparent',
    color: '#6b6b6b',
    cursor: 'pointer',
    fontSize: '0.9rem',
    fontWeight: '500',
    transition: 'all 0.2s ease'
  },
  tabBtnActive: {
    background: '#eff6ff',
    color: '#2563eb',
    fontWeight: 'bold'
  },
  main: {
    padding: '24px'
  },
  btn: {
    padding: '10px 20px',
    borderRadius: '8px',
    border: 'none',
    background: '#2563eb',
    color: '#ffffff',
    fontWeight: 'bold',
    cursor: 'pointer',
    marginTop: '12px',
    boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
    transition: 'background 0.2s'
  },
  input: {
    padding: '10px 12px',
    borderRadius: '8px',
    border: '1px solid #e5e7eb',
    background: '#ffffff',
    color: '#2d2c2c',
    fontSize: '1rem',
    width: '100%',
    boxSizing: 'border-box',
    outline: 'none',
    transition: 'border-color 0.2s'
  },
  textarea: {
    padding: '12px',
    borderRadius: '8px',
    border: '1px solid #e5e7eb',
    background: '#ffffff',
    color: '#2d2c2c',
    fontSize: '1rem',
    width: '100%',
    minHeight: '100px',
    boxSizing: 'border-box',
    resize: 'vertical',
    outline: 'none'
  },
  column: {
    minWidth: '280px',
    maxWidth: '320px',
    background: 'transparent',
    borderRadius: '12px',
    padding: '0',
    marginRight: '24px',
    marginBottom: '16px'
  },
  card: {
    background: '#ffffff',
    borderRadius: '10px',
    padding: '16px',
    marginBottom: '12px',
    border: '1px solid #e5e7eb',
    borderLeft: '4px solid',
    boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
  },
  actionBtn: {
    padding: '6px 12px',
    borderRadius: '6px',
    border: '1px solid #e5e7eb',
    background: '#ffffff',
    color: '#6b6b6b',
    cursor: 'pointer',
    fontSize: '0.8rem',
    marginRight: '6px',
    marginBottom: '6px',
    transition: 'all 0.1s'
  },
  deleteBtn: {
    padding: '6px 12px',
    borderRadius: '6px',
    border: '1px solid #fee2e2',
    background: '#fef2f2',
    color: '#ef4444',
    cursor: 'pointer',
    fontSize: '0.8rem'
  },
  chip: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
    padding: '4px 12px',
    borderRadius: '20px',
    background: '#eff6ff',
    color: '#2563eb',
    fontSize: '0.85rem',
    marginRight: '8px',
    marginBottom: '8px',
    border: '1px solid #dbeafe'
  },
  timeInput: {
    padding: '6px 8px',
    borderRadius: '6px',
    border: '1px solid #e5e7eb',
    background: '#ffffff',
    color: '#2d2c2c',
    fontSize: '0.9rem',
    width: '90px',
    textAlign: 'center'
  },
  overlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'rgba(0,0,0,0.4)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000
  },
  dialog: {
    background: '#ffffff',
    borderRadius: '16px',
    padding: '24px',
    maxWidth: '400px',
    width: '90%',
    boxShadow: '0 10px 25px rgba(0,0,0,0.1)'
  },
  error: {
    background: '#fef2f2',
    border: '1px solid #fee2e2',
    borderRadius: '8px',
    padding: '12px',
    color: '#ef4444',
    marginBottom: '12px'
  },
  timeInputError: {
    borderColor: '#ef4444',
    background: '#fef2f2'
  },
  sessionItem: {
    background: '#f9fafb',
    borderRadius: '8px',
    padding: '10px 12px',
    marginBottom: '8px',
    border: '1px solid #e5e7eb'
  },
  sessionDeleteBtn: {
    padding: '4px 8px',
    borderRadius: '4px',
    border: '1px solid #fee2e2',
    background: '#fef2f2',
    color: '#ef4444',
    cursor: 'pointer',
    fontSize: '0.75rem'
  },
  addSessionBtn: {
    padding: '8px 16px',
    borderRadius: '6px',
    border: '1px dashed #e5e7eb',
    background: 'transparent',
    color: '#6b6b6b',
    cursor: 'pointer',
    fontSize: '0.85rem',
    width: '100%',
    marginTop: '8px'
  }
};
