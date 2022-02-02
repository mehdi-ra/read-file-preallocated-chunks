"use strict";

import * as fs from 'fs';

const CHUNK_SIZE = 100;

const readFile = (async function () {
    const readBytes = function (fd, sharedBuffer) {

        return new Promise((resolve, reject) => {
            fs.read(fd, sharedBuffer, 0, sharedBuffer.length, null, (err, bytes, buffer) => {
                if (err) reject(err);
                resolve();
            });
        });
    };

    const generateChunks = async function* (filePath, size) {
        let end, bytesRead = 0;
        end = size;

        const fd = fs.openSync(filePath);
        const stats = fs.statSync(filePath);
        const sharedBuffer = Buffer.alloc(size);

        for (let index = 0; index < Math.ceil(stats.size / size); index++) {
            await readBytes(fd, sharedBuffer);

            bytesRead = (index + 1) * size;

            if (bytesRead > stats.size) {
                end = size - (bytesRead - stats.size);
            }

            yield sharedBuffer.slice(0, end);
        }

    }

    return {
        generateChunks,
    }

});

const init = (async function () {
    const generateChunks = (await readFile()).generateChunks('./files/nouns.csv', CHUNK_SIZE);

    const file = [];

    for await (const chunk of generateChunks) {
        file.push(chunk)
    }

    console.log(Buffer.concat(file).toString())

});


init();
