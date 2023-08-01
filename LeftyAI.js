export default class LeftyAI {
  
  constructor() {
    this.actions = ['FORWARD', 'LEFT'];
  }
  
  getActions() {
    return this.actions;
  }
  
  setStaticWorldState(state) {
    console.log('Lefty: Received static state:\n' + JSON.stringify(state));
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