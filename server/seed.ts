import { DataSource } from 'typeorm';
import { Pokemon } from './src/pokemon/entities/pokemon.entity';
import { Move } from './src/moves/entities/move.entity';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.join(__dirname, '.env') });
// fallback if env load fails
const DB_PASS = process.env.POSTGRES_PASSWORD || 'password';

// Curated list of 10 "Famous" Pokemon for initial testing
const POKEMON_DATA = [
    {
        name: 'Charizard',
        types: ['fire', 'flying'],
        baseStats: { hp: 78, atk: 84, def: 78, spa: 109, spd: 85, spe: 100 },
        spriteUrl: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/6.png',
    },
    {
        name: 'Pikachu',
        types: ['electric'],
        baseStats: { hp: 35, atk: 55, def: 40, spa: 50, spd: 50, spe: 90 },
        spriteUrl: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/25.png',
    },
    {
        name: 'Mewtwo',
        types: ['psychic'],
        baseStats: { hp: 106, atk: 110, def: 90, spa: 154, spd: 90, spe: 130 },
        spriteUrl: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/150.png',
    },
    {
        name: 'Gengar',
        types: ['ghost', 'poison'],
        baseStats: { hp: 60, atk: 65, def: 60, spa: 130, spd: 75, spe: 110 },
        spriteUrl: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/94.png',
    },
    {
        name: 'Gyarados',
        types: ['water', 'flying'],
        baseStats: { hp: 95, atk: 125, def: 79, spa: 60, spd: 100, spe: 81 },
        spriteUrl: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/130.png',
    },
    {
        name: 'Dragonite',
        types: ['dragon', 'flying'],
        baseStats: { hp: 91, atk: 134, def: 95, spa: 100, spd: 100, spe: 80 },
        spriteUrl: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/149.png',
    },
    {
        name: 'Snorlax',
        types: ['normal'],
        baseStats: { hp: 160, atk: 110, def: 65, spa: 65, spd: 110, spe: 30 },
        spriteUrl: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/143.png',
    },
    {
        name: 'Lucario',
        types: ['fighting', 'steel'],
        baseStats: { hp: 70, atk: 110, def: 70, spa: 115, spd: 70, spe: 90 },
        spriteUrl: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/448.png',
    },
    {
        name: 'Greninja',
        types: ['water', 'dark'],
        baseStats: { hp: 72, atk: 95, def: 67, spa: 103, spd: 71, spe: 122 },
        spriteUrl: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/658.png',
    },
    {
        name: 'Garchomp',
        types: ['dragon', 'ground'],
        baseStats: { hp: 108, atk: 130, def: 95, spa: 80, spd: 85, spe: 102 },
        spriteUrl: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/445.png',
    },
];

const AppDataSource = new DataSource({
    type: 'postgres',
    host: process.env.POSTGRES_HOST || 'localhost',
    port: parseInt(process.env.POSTGRES_PORT || '5433'),
    username: 'pokemon',
    password: 'password',
    database: process.env.POSTGRES_DB || 'pokemon_battle',
    entities: [Pokemon, Move],
    synchronize: true, // Auto-create tables if missing
});

async function seed() {
    await AppDataSource.initialize();
    console.log('Database connected for seeding...');

    const pokemonRepo = AppDataSource.getRepository(Pokemon);

    for (const p of POKEMON_DATA) {
        const existing = await pokemonRepo.findOneBy({ name: p.name });
        if (!existing) {
            const newMon = pokemonRepo.create({
                name: p.name,
                types: p.types,
                baseStats: p.baseStats,
                frontSpriteUrl: p.spriteUrl,
                moves: [], // Placeholder
            });
            await pokemonRepo.save(newMon);
            console.log(`Seeded: ${p.name}`);
        } else {
            console.log(`Skipped: ${p.name} (Exists)`);
        }
    }

    console.log('Seeding complete.');
    process.exit(0);
}

seed().catch((err) => {
    console.error(err);
    process.exit(1);
});
