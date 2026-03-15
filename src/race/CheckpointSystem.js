import { WAYPOINTS, CHECKPOINT_INDICES } from '../track/trackData.js';

/**
 * Tracks laps and checkpoints for both cars.
 * A car must pass all checkpoints in order before crossing the finish line
 * for a lap to count.
 */
export class CheckpointSystem {

  constructor(scene, totalLaps = 3) {
    this.scene = scene;
    this.totalLaps = totalLaps;

    // Checkpoint positions from waypoints
    this.checkpoints = CHECKPOINT_INDICES.map(i => WAYPOINTS[i]);
    this.finishLine = WAYPOINTS[0]; // First waypoint is start/finish
    this.checkpointRadius = 50;

    // Per-car state
    this.cars = new Map();
  }

  registerCar(car, id) {
    this.cars.set(id, {
      car,
      currentCheckpoint: 0,
      lap: 0,
      lapTimes: [],
      lapStartTime: 0,
      totalTime: 0,
      finished: false,
      passedStart: false
    });
  }

  startRace() {
    const now = this.scene.time.now;
    for (const state of this.cars.values()) {
      state.lapStartTime = now;
      state.lap = 0;
      state.currentCheckpoint = 0;
      state.passedStart = false;
    }
  }

  update() {
    for (const [id, state] of this.cars.entries()) {
      if (state.finished) continue;

      const car = state.car;
      const checkpoint = this.checkpoints[state.currentCheckpoint];

      if (!checkpoint) continue;

      const dist = this.distance(car.x, car.y, checkpoint.x, checkpoint.y);

      if (dist < this.checkpointRadius) {
        state.currentCheckpoint++;

        // Check if all checkpoints passed — check for finish line
        if (state.currentCheckpoint >= this.checkpoints.length) {
          state.currentCheckpoint = 0;
          state.lap++;

          const now = this.scene.time.now;
          const lapTime = now - state.lapStartTime;
          state.lapTimes.push(lapTime);
          state.lapStartTime = now;

          if (state.lap >= this.totalLaps) {
            state.finished = true;
            state.totalTime = state.lapTimes.reduce((a, b) => a + b, 0);
          } else {
            // Show lap notification
            this.scene.showLapNotification(id, state.lap);
          }
        }
      }
    }
  }

  getLap(id) {
    const state = this.cars.get(id);
    return state ? state.lap : 0;
  }

  getTotalLaps() {
    return this.totalLaps;
  }

  isFinished(id) {
    const state = this.cars.get(id);
    return state ? state.finished : false;
  }

  getResults(id) {
    const state = this.cars.get(id);
    if (!state) return null;
    return {
      totalTime: state.totalTime,
      lapTimes: state.lapTimes,
      bestLap: state.lapTimes.length > 0 ? Math.min(...state.lapTimes) : 0
    };
  }

  /**
   * Get a 0-1 progress value for position comparison.
   * Accounts for lap number and checkpoint progress.
   */
  getProgress(id) {
    const state = this.cars.get(id);
    if (!state) return 0;
    const lapProgress = state.currentCheckpoint / this.checkpoints.length;
    return state.lap + lapProgress;
  }

  /**
   * Returns 1 if car `id` is in first place, 2 if second.
   */
  getPosition(id) {
    const entries = [...this.cars.entries()];
    if (entries.length < 2) return 1;

    const [id1, state1] = entries[0];
    const [id2, state2] = entries[1];

    const prog1 = this.getProgress(id1);
    const prog2 = this.getProgress(id2);

    if (id === id1) {
      return prog1 >= prog2 ? 1 : 2;
    } else {
      return prog2 >= prog1 ? 1 : 2;
    }
  }

  distance(x1, y1, x2, y2) {
    return Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
  }
}
