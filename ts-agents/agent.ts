
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
                this.gatherDirt()

            }
        });
    }

    gatherDirt() {
        this.bot.pathfinder.setGoal(null);

        // Find the nearest dirt block
        const dirtBlock = this.bot.findBlock({
            matching: this.bot.registry.blocksByName.dirt.id,
            maxDistance: 16
        });

        if (!dirtBlock) {
            this.bot.chat("I can't find any dirt nearby!");
            return;
        }

        // Set up movements and goal
        const defaultMove = new Movements(this.bot);
        this.bot.pathfinder.setMovements(defaultMove);
        this.bot.pathfinder.setGoal(new GoalBlock(dirtBlock.position.x, dirtBlock.position.y, dirtBlock.position.z));

        // Wait for the bot to reach the goal
        this.bot.once('goal_reached', async () => {
            // Equip a shovel if available
            const tool = this.bot.inventory.items().find(item => item.name.includes('shovel')) || this.bot.heldItem;
            if (tool) await this.bot.equip(tool, 'hand');

            // Dig the dirt block
            await this.bot.dig(dirtBlock);
            this.bot.chat("I've mined a dirt block!");
        });
    }
}
