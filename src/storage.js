// ローカルストレージのラッパー
// window.storage APIをシミュレート

const storage = {
  async get(key) {
    try {
      const value = localStorage.getItem(key);
      return value ? { value } : null;
    } catch (error) {
      console.error('Storage get error:', error);
      return null;
    }
  },

  async set(key, value) {
    try {
      localStorage.setItem(key, value);
      return { success: true };
    } catch (error) {
      console.error('Storage set error:', error);
      return { success: false, error };
    }
  },

  async remove(key) {
    try {
      localStorage.removeItem(key);
      return { success: true };
    } catch (error) {
      console.error('Storage remove error:', error);
      return { success: false, error };
    }
  }
};

// window.storage として利用可能にする
if (typeof window !== 'undefined') {
  window.storage = storage;
}

export default storage;
