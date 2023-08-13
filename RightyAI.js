export default class RightyAI {
  
  constructor() {
    this.actions = ['FORWARD', 'RIGHT'];
    console.log('Righty: Starting');
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