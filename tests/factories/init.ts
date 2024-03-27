import { FactoryGirl, SequelizeAdapter } from 'factory-girl-ts';
export function initializeFactories() {
  FactoryGirl.setAdapter(new SequelizeAdapter());
}
