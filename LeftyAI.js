export default class LeftyAI {
  
  constructor() {
    this.actions = ['FORWARD', 'LEFT'];
  }
  
  getActions() {
    return this.actions;
  }
  
  setStaticWorldState(state) {
    // ... 
  }
  
  setDynamicWorldState(state) {
    // ... 
  }
  
  setDeltaWorldState(state) {
    // ...   
  }
  
  setCollisions(collisions) {
    // ... 
  }
}