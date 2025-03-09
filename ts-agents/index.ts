import { Agent } from './agent.ts';


const createAgentWithDelay = (name: string, delay: number) => {
  setTimeout(() => {
    new Agent(name);
    console.log(`Agent ${name} created after ${delay}ms`);
  }, delay);
};

// Example: Create 5 agents with a 2-second interval
for (let i = 0; i < 5; i++) {
  createAgentWithDelay(`Bot${i + 1}`, i * 50);
}
