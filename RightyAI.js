export default class RightyAI {
  
  constructor() {
    this.actions = ['FORWARD', 'RIGHT'];
  }
  
  getActions() {
    return this.actions;
  }
  
  setStaticWorldState(state) {
    console.log('Righty: Received static state:\n' + JSON.stringify(state));
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