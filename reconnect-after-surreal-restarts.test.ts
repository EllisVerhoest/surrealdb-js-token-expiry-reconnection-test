import {beforeAll, expect, it} from 'bun:test';
import {startSurreal, stopSurreal, waitForSurreal} from './surreal-instance.ts';
import {Surreal} from 'surrealdb';

beforeAll(async () => {
    let root = new Surreal();
    await root.connect('ws://127.0.0.1:49516', {
        auth: {
            username: 'root',
            password: 'root',
        },
        database: 'test',
        namespace: 'test',
        reconnect: true,
    });

    await root.query(`
        DEFINE USER database_user_test 
        ON DATABASE
        PASSWORD 'database_user_test'
        DURATION FOR SESSION 12h, FOR TOKEN 1s;
    `);

    await root.close();
});

it('database user reconnects after restart', async () => {
    let dbUser = new Surreal();
    await dbUser.connect('ws://127.0.0.1:49516', {
        auth: {
            database: 'test',
            namespace: 'test',
            username: 'database_user_test',
            password: 'database_user_test',
        },
        database: 'test',
        namespace: 'test',
        reconnect: true,
    });

    expect(await dbUser.ping()).toEqual(true);

    await stopSurreal();
    console.log('\\/ \\/ \\/ Surreal is DOWN!');
    await new Promise(res => setTimeout(res, 1000)); // <-- let token expire
    await startSurreal();
    await waitForSurreal();
    console.log('/\\ /\\ /\\ Surreal is UP!');

    expect(await dbUser.ping()).toEqual(true);
}); 