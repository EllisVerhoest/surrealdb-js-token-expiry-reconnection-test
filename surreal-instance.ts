import {$} from 'bun';
import {join} from 'path';
import {existsSync, rmSync} from 'fs';

const bind = '127.0.0.1:49516';
let surrealdbProcess: Bun.Subprocess<any, any, any>;

async function checkAndGetSurrealBinary() {
    let cpu = (await $`uname -m`.text()).trim();
    switch (cpu) {
        case 'amd64':
        case 'x64':
        case 'x86-64':
        case 'x86_64':
            cpu = 'amd64';
            break;
        case 'arm64':
        case 'aarch64':
            cpu = 'arm64';
            break;
    }

    let oss = (await $`uname -s`.text()).trim();
    switch (oss) {
        case 'Linux':
            oss = 'linux';
            break;
        case 'Darwin':
            oss = 'darwin';
            break;
        default:
            oss = 'windows';
            break;
    }


    let arch = `${oss}-${cpu}`;
    let version = 'v2.3.0';
    let filename = `surreal-bin-${arch}-${version}`;
    let filepath = join(process.cwd(), `/${filename}`);

    if (!existsSync(filepath)) {
        await $`curl https://download.surrealdb.com/${version}/surreal-${version}.${arch}.tgz -o ${filename}.tgz && tar -xvzf ${filename}.tgz && mv surreal ${filepath} && rm ${filename}.tgz`;
    }

    return filepath;
}

export async function waitForSurreal() {
    let tries = 10;
    while (true) {
        try {
            let response = await fetch(`http://${bind}/health`);

            if (response.status === 200) {
                return true;
            }
        } catch (e) {

        }


        tries--;
        if (tries === 0) {
            return false;
        }

        await new Promise(res => setTimeout(res, 1000));
    }
}

export async function startSurreal(binPath: string | undefined = process.env.SURREAL_BIN_PATH) {
    binPath ??= await checkAndGetSurrealBinary();
    surrealdbProcess = Bun.spawn(`${binPath} start -A -b ${bind} -u root -p root rocksdb:testdatabase.db`.split(' '));
}

export function stopSurreal() {
    surrealdbProcess.kill('SIGTERM');
    return surrealdbProcess.exited;
}

export function killSurreal() {
    surrealdbProcess.kill('SIGKILL');
    return surrealdbProcess.exited;
}

export function deletePersistenceFile() {
    rmSync('testdatabase.db', {
        recursive: true,
        force: true,
    });
}