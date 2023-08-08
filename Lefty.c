int main() { 
  while(1) {
    sleep(1);
  }
  return 0;
}

char ** getActions() {
  char ** actions = { "FORWARD", "LEFT" };
  return actions;
}

void setStaticWorldState(char ** state) {
}

void setDynamicWorldState(char ** state) {
}

void setDeltaWorldState(char ** state) {
}

void setCollisions(char ** collisions) {
}