import {afterAll, beforeAll} from 'bun:test';
import {deletePersistenceFile, killSurreal, startSurreal, waitForSurreal} from './surreal-instance.ts';


beforeAll(async () => {
    await startSurreal();
    await waitForSurreal();
});

afterAll(async () => {
    await killSurreal();
    deletePersistenceFile();
});