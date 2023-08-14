export default class TurkAI {
  
  constructor() {
    this.actions = [];
    console.log('Turk: Starting');
  }
  
  getActions() {
    return this.actions;
  }
  
  setStaticWorldState(state) {
    console.log('Turk: Received static state:\n' + JSON.stringify(state));
  }
  
  setDynamicWorldState(state) {
    // console.log(JSON.stringify(state));
  }
  
  setDeltaWorldState(state) {
    // console.log(JSON.stringify(state));
  }
  
  setCollisions(collisions) {
    // console.log(JSON.stringify(collisions));
  }
}