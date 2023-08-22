import turkWsServer from './TurkServer.js';

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
    if(!this.driver)
      this.driver = turkWsServer.getDriver(this);
    if(this.driver)
      this.driver.send(JSON.stringify({ static: state }));
  }
  
  setDynamicWorldState(state) {
    if(!this.driver) {
      this.driver = turkWsServer.getDriver(this);
    }
    if(this.driver)
      this.driver.send(JSON.stringify({ dynamic: state }));
  }
  
  setDeltaWorldState(state) {
    // console.log(JSON.stringify(state));
  }
  
  setCollisions(collisions) {
    // console.log(JSON.stringify(collisions));
  }
}