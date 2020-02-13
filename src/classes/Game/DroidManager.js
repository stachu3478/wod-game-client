class DroidManager {
  constructor() {
    this.droids = [];
    this.selected = [];
  }

  findActorDroids(quantity) {
    let n = 0;
    const ds = [];
    this.selected.forEach((s) => {
      if (++n >= quantity) return;
      const d = this.droids[s];
      if (d.type === 0) {
        ds.push(d.id);
      }
    });
    return ds;
  }

  getDroids() {
    return this.droids;
  }

  getSelected() {
    return this.selected;
  }
}

export default DroidManager;
