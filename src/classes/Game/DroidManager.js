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

  selectByTeam(myTeam) {
    this.droids.forEach((u) => {
      if (u && u.team === myTeam && u.type !== 3) {
        if (this.selected.indexOf(u.id) === -1) this.selected.push(u.id);
      }
    });
  }

  clearSelection() {
    this.selected.splice(0);
  }

  getDroids() {
    return this.droids;
  }

  getSelected() {
    return this.selected;
  }
}

export default DroidManager;
