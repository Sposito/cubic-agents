
import mineflayer, { type Bot } from 'mineflayer'
import { pathfinder, goals, Movements } from 'mineflayer-pathfinder'

const GoalFollow = goals.GoalFollow;
const { GoalBlock } = goals;

export class Agent {
    bot: Bot;

    constructor(name: string) {
        // Create the bot instance
        this.bot = mineflayer.createBot({
            host: 'server',
            port: 25565,
            username: name
        });

        this.bot.loadPlugin(pathfinder);

        this.bot.on('login', () => {
            console.log(`${this.bot.username} has logged in`);
        });

        this.bot.on('error', (err) => {
            console.error(`Error in ${this.bot.username}:`, err);
        });

        this.bot.on('kicked', (reason) => {
            console.warn(`${this.bot.username} was kicked: ${reason}`);
        });

        this.bot.on('end', () => {
            console.warn(`${this.bot.username} disconnected.`);
        });

        this.bot.on('chat', (username, message) => {

            if (username === this.bot.username) return;


            if (message === 'follow me') {
                const player = this.bot.players[username];
                if (!player || !player.entity) {
                    this.bot.chat("I can't see you!");
                    return;
                }
                this.bot.pathfinder.setGoal(new GoalFollow(player.entity, 3), true);
            }


            if (message === 'mine') {
                this.gatherDirt(32)

            }

            if (message === 'spread') {
                this.spread()

            }
        });
    }

    async gatherDirt(amount: number) {
        this.bot.pathfinder.setGoal(null); // Stop movement before digging
    
        let gathered = 0;
        const maxStackSize = 64;
        const inventorySpace = this.bot.inventory.emptySlotCount() * maxStackSize;
    
        if (amount > inventorySpace) {
            this.bot.chat("I don't have enough inventory space for that much dirt!");
            return;
        }
    
        while (gathered < amount) {
            let dirtBlock = this.bot.findBlock({
                matching: this.bot.registry.blocksByName.dirt.id,
                maxDistance: 16
            });
    
            if (!dirtBlock) {
                this.bot.chat("I can't find any more dirt nearby!");
                return;
            }
    
            const defaultMove = new Movements(this.bot);
            this.bot.pathfinder.setMovements(defaultMove);
            this.bot.pathfinder.setGoal(new GoalBlock(dirtBlock.position.x, dirtBlock.position.y, dirtBlock.position.z));
    
            await new Promise<void>(resolve => this.bot.once('goal_reached', resolve));
    
            // Double-check if the block still exists before digging
            if (!this.bot.blockAt(dirtBlock.position)) {
                this.bot.chat("The block disappeared! Searching for a new one...");
                continue; // Go back to the start of the loop and look for a new block
            }
    
            const tool = this.bot.inventory.items().find(item => item.name.includes('shovel')) ?? this.bot.heldItem;
            if (tool) await this.bot.equip(tool, 'hand');
    
            try {
                await this.bot.dig(dirtBlock);
                gathered++;
                this.bot.chat(`I've mined ${gathered}/${amount} dirt blocks!`);
            } catch (err) {
                this.bot.chat(`Failed to dig: ${err.message}`);
            }
        }
    
        this.bot.chat("I've gathered all the dirt you requested!");
    }
    

    spread() {
        const startPosition = this.bot.entity.position;
    
        const offsetX = Math.floor(Math.random() * 8) + 1; // Random offset between 1 and 8
        const offsetZ = Math.floor(Math.random() * 8) + 1;
        
        const targetX = startPosition.x + (Math.random() < 0.5 ? offsetX : -offsetX);
        const targetZ = startPosition.z + (Math.random() < 0.5 ? offsetZ : -offsetZ);
        const targetY = startPosition.y; // Keep the same Y level
    
        const defaultMove = new Movements(this.bot);
        this.bot.pathfinder.setMovements(defaultMove);
        this.bot.pathfinder.setGoal(new GoalBlock(Math.floor(targetX), Math.floor(targetY), Math.floor(targetZ)));
    }
    
    

    
    
}
