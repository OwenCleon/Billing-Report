// Local storage service for data persistence
class LocalStorageService {
  static getData(category) {
    try {
      const data = localStorage.getItem(category);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error getting data from localStorage:', error);
      return [];
    }
  }

  static saveData(category, data) {
    try {
      localStorage.setItem(category, JSON.stringify(data));
      return true;
    } catch (error) {
      console.error('Error saving data to localStorage:', error);
      return false;
    }
  }

  static addItem(category, item) {
    const data = this.getData(category);
    const newItem = {
      ...item,
      id: Date.now().toString() // Simple ID generation
    };
    data.push(newItem);
    return this.saveData(category, data);
  }

  static updateItem(category, id, updatedItem) {
    const data = this.getData(category);
    const index = data.findIndex(item => item.id === id);
    if (index !== -1) {
      data[index] = { ...data[index], ...updatedItem };
      return this.saveData(category, data);
    }
    return false;
  }

  static deleteItem(category, id) {
    const data = this.getData(category);
    const filteredData = data.filter(item => item.id !== id);
    return this.saveData(category, filteredData);
  }

  static clearAll() {
    const categories = ['pam-jaya', 'listrik-pln', 'pam-lainnya', 'transaksi-umum', 'penerimaan-negara'];
    categories.forEach(category => {
      localStorage.removeItem(category);
    });
  }
}

export default LocalStorageService;