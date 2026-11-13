/**
 * Gala3D - Undo / Redo Command History Stack
 */

export class History {
  constructor(maxStates = 40) {
    this.maxStates = maxStates;
    this.undoStack = [];
    this.redoStack = [];
    this.isApplying = false;
  }

  push(state) {
    if (this.isApplying) return;
    // Deep clone state snapshot
    const snapshot = JSON.stringify(state);
    if (this.undoStack.length > 0 && this.undoStack[this.undoStack.length - 1] === snapshot) {
      return; // No-op if identical
    }

    this.undoStack.push(snapshot);
    if (this.undoStack.length > this.maxStates) {
      this.undoStack.shift();
    }
    // Any new action clears the redo stack
    this.redoStack = [];
  }

  canUndo() {
    return this.undoStack.length > 1;
  }

  canRedo() {
    return this.redoStack.length > 0;
  }

  undo(currentState) {
    if (!this.canUndo()) return null;

    this.isApplying = true;
    const current = this.undoStack.pop();
    this.redoStack.push(current);

    const previousSnapshot = this.undoStack[this.undoStack.length - 1];
    const state = JSON.parse(previousSnapshot);
    this.isApplying = false;

    return state;
  }

  redo() {
    if (!this.canRedo()) return null;

    this.isApplying = true;
    const nextSnapshot = this.redoStack.pop();
    this.undoStack.push(nextSnapshot);

    const state = JSON.parse(nextSnapshot);
    this.isApplying = false;

    return state;
  }

  clear() {
    this.undoStack = [];
    this.redoStack = [];
  }
}
