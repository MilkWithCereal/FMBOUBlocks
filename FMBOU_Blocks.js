/*
   This extension was made with TurboBuilder!
   https://turbobuilder-steel.vercel.app/
*/
(function(Scratch) {
    const variables = {};
    const blocks = [];
    const menus = [];


    function doSound(ab, cd, runtime) {
        const audioEngine = runtime.audioEngine;

        const fetchAsArrayBufferWithTimeout = (url) =>
            new Promise((resolve, reject) => {
                const xhr = new XMLHttpRequest();
                let timeout = setTimeout(() => {
                    xhr.abort();
                    reject(new Error("Timed out"));
                }, 5000);
                xhr.onload = () => {
                    clearTimeout(timeout);
                    if (xhr.status === 200) {
                        resolve(xhr.response);
                    } else {
                        reject(new Error(`HTTP error ${xhr.status} while fetching ${url}`));
                    }
                };
                xhr.onerror = () => {
                    clearTimeout(timeout);
                    reject(new Error(`Failed to request ${url}`));
                };
                xhr.responseType = "arraybuffer";
                xhr.open("GET", url);
                xhr.send();
            });

        const soundPlayerCache = new Map();

        const decodeSoundPlayer = async (url) => {
            const cached = soundPlayerCache.get(url);
            if (cached) {
                if (cached.sound) {
                    return cached.sound;
                }
                throw cached.error;
            }

            try {
                const arrayBuffer = await fetchAsArrayBufferWithTimeout(url);
                const soundPlayer = await audioEngine.decodeSoundPlayer({
                    data: {
                        buffer: arrayBuffer,
                    },
                });
                soundPlayerCache.set(url, {
                    sound: soundPlayer,
                    error: null,
                });
                return soundPlayer;
            } catch (e) {
                soundPlayerCache.set(url, {
                    sound: null,
                    error: e,
                });
                throw e;
            }
        };

        const playWithAudioEngine = async (url, target) => {
            const soundBank = target.sprite.soundBank;

            let soundPlayer;
            try {
                const originalSoundPlayer = await decodeSoundPlayer(url);
                soundPlayer = originalSoundPlayer.take();
            } catch (e) {
                console.warn(
                    "Could not fetch audio; falling back to primitive approach",
                    e
                );
                return false;
            }

            soundBank.addSoundPlayer(soundPlayer);
            await soundBank.playSound(target, soundPlayer.id);

            delete soundBank.soundPlayers[soundPlayer.id];
            soundBank.playerTargets.delete(soundPlayer.id);
            soundBank.soundEffects.delete(soundPlayer.id);

            return true;
        };

        const playWithAudioElement = (url, target) =>
            new Promise((resolve, reject) => {
                const mediaElement = new Audio(url);

                mediaElement.volume = target.volume / 100;

                mediaElement.onended = () => {
                    resolve();
                };
                mediaElement
                    .play()
                    .then(() => {
                        // Wait for onended
                    })
                    .catch((err) => {
                        reject(err);
                    });
            });

        const playSound = async (url, target) => {
            try {
                if (!(await Scratch.canFetch(url))) {
                    throw new Error(`Permission to fetch ${url} denied`);
                }

                const success = await playWithAudioEngine(url, target);
                if (!success) {
                    return await playWithAudioElement(url, target);
                }
            } catch (e) {
                console.warn(`All attempts to play ${url} failed`, e);
            }
        };

        playSound(ab, cd)
    }
    class Extension {
        getInfo() {
            return {
                "blockIconURI": "data:image/svg+xml;base64,PHN2ZyB2ZXJzaW9uPSIxLjEiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgeG1sbnM6eGxpbms9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmsiIHdpZHRoPSIyMy4yNzA0IiBoZWlnaHQ9IjIyLjcxNzAyIiB2aWV3Qm94PSIwLDAsMjMuMjcwNCwyMi43MTcwMiI+PGcgdHJhbnNmb3JtPSJ0cmFuc2xhdGUoLTMwNy43Nzk1NywtMTY5LjY3NTA3KSI+PGcgZGF0YS1wYXBlci1kYXRhPSJ7JnF1b3Q7aXNQYWludGluZ0xheWVyJnF1b3Q7OnRydWV9IiBmaWxsPSIjYmJhZWZmIiBmaWxsLXJ1bGU9Im5vbnplcm8iIHN0cm9rZT0iIzhhNzNmZiIgc3Ryb2tlLXdpZHRoPSIxLjUiIHN0cm9rZS1saW5lY2FwPSJidXR0IiBzdHJva2UtbGluZWpvaW49Im1pdGVyIiBzdHJva2UtbWl0ZXJsaW1pdD0iMTAiIHN0cm9rZS1kYXNoYXJyYXk9IiIgc3Ryb2tlLWRhc2hvZmZzZXQ9IjAiIHN0eWxlPSJtaXgtYmxlbmQtbW9kZTogbm9ybWFsIj48cGF0aCBkPSJNMzI4LjM5NjQ4LDE4OS4xODkyNWMtMS4zNDM0MywxLjM4NjggLTcuMzUxMDMsLTIuMzU0MzEgLTcuMzUxMDMsLTIuMzU0MzFjMCwwIC00LjM2OTQ1LDUuNTY2NDEgLTYuMTAxNzksNC43MTk0NWMtMS43MzIyNSwtMC44NDY5OSAtMC4wMzI4OCwtNy43MTI4NCAtMC4wMzI4OCwtNy43MTI4NGMwLDAgLTYuNjQxMTksLTIuNDQxMDcgLTYuMzczMzIsLTQuMzQ3NzJjMC4yNjk3OSwtMS45MDk5NSA3LjMyNTA3LC0yLjQxMzUyIDcuMzI1MDcsLTIuNDEzNTJjMCwwIDAuMjY0NjcsLTcuMDcyMjYgMi4xNjY3OSwtNy40MDUyNGMxLjg5OTAyLC0wLjMzNDk2IDQuNTU2ODMsNi4yMjIxMiA0LjU1NjgzLDYuMjIyMTJjMCwwIDYuODEwMDYsLTEuOTMzNTQgNy43MTM4MiwtMC4yMzA0MWMwLjkwOTU1LDEuNzA0MjggLTQuNTAyOTIsNi4yNTk4NyAtNC41MDI5Miw2LjI1OTg3YzAsMCAzLjkzNzkzLDUuODc3MTIgMi41OTk0Myw3LjI2MjYxeiIvPjwvZz48L2c+PC9zdmc+PCEtLXJvdGF0aW9uQ2VudGVyOjEyLjIyMDQzMDY3MTI4MDk1MToxMC4zMjQ5Mjk5NDg0NDcyMi0tPg==",
                "id": "FMBOUBlocks",
                "name": "FMBOU Blocks",
                "color1": "#cdccff",
                "color2": "#b499ff",
                "color3": "#aa99ff",
                "tbShow": true,
                "blocks": blocks
            }
        }
    }
    blocks.push({
        opcode: `setsongid`,
        blockType: Scratch.BlockType.COMMAND,
        text: `GAME: set current track to [song_id]`,
        arguments: {
            "song_id": {
                type: Scratch.ArgumentType.STRING,
                defaultValue: 'test',
            },
        },
        disableMonitor: true
    });
    Extension.prototype[`setsongid`] = (args, util) => {
        variables['track_id'] = args["song_id"]
    };

    blocks.push({
        opcode: `getsongid`,
        blockType: Scratch.BlockType.REPORTER,
        text: `GAME: get current track`,
        arguments: {},
        disableMonitor: true
    });
    Extension.prototype[`getsongid`] = (args, util) => {
        return variables['track_id']
    };

    blocks.push({
        opcode: `preferenceset`,
        blockType: Scratch.BlockType.COMMAND,
        text: `PLAYER: Set Cursor Preference [mode]`,
        arguments: {
            "mode": {
                type: Scratch.ArgumentType.STRING,
                defaultValue: 'Arrows',
            },
        },
        disableMonitor: true
    });
    Extension.prototype[`preferenceset`] = (args, util) => {
        localStorage.setItem('selectpref_player', args["mode"])
    };

    blocks.push({
        opcode: `preferencegetARR`,
        blockType: Scratch.BlockType.BOOLEAN,
        text: `PLAYER: Prefers arrow keys?`,
        arguments: {},
        disableMonitor: true
    });
    Extension.prototype[`preferencegetARR`] = (args, util) => {
        return (localStorage.getItem('selectpref_player') == 'Arrows')
    };

    blocks.push({
        opcode: `preferencegetMOU`,
        blockType: Scratch.BlockType.BOOLEAN,
        text: `PLAYER: Prefers mouse?`,
        arguments: {},
        disableMonitor: true
    });
    Extension.prototype[`preferencegetMOU`] = (args, util) => {
        return (localStorage.getItem('selectpref_player') == 'Mouse')
    };

    blocks.push({
        opcode: `preferencerepARR`,
        blockType: Scratch.BlockType.REPORTER,
        text: `PLAYER: Arrow Keys`,
        arguments: {},
        disableMonitor: true
    });
    Extension.prototype[`preferencerepARR`] = (args, util) => {
        return 'Arrows'
    };

    blocks.push({
        opcode: `preferencerepM`,
        blockType: Scratch.BlockType.REPORTER,
        text: `PLAYER: Mouse`,
        arguments: {},
        disableMonitor: true
    });
    Extension.prototype[`preferencerepM`] = (args, util) => {
        return 'Mouse'
    };

    blocks.push({
        opcode: `audio_slot`,
        blockType: Scratch.BlockType.REPORTER,
        text: `AUDIO: Audio slot [slot]`,
        arguments: {
            "slot": {
                type: Scratch.ArgumentType.NUMBER,
                defaultValue: 1,
            },
        },
        disableMonitor: true
    });
    Extension.prototype[`audio_slot`] = (args, util) => {
        return ('slot_' + args["slot"])
    };

    blocks.push({
        opcode: `levelset`,
        blockType: Scratch.BlockType.COMMAND,
        text: `LEVELING: set player level to [lvl]`,
        arguments: {
            "lvl": {
                type: Scratch.ArgumentType.NUMBER,
                defaultValue: 1,
            },
        },
        disableMonitor: true
    });
    Extension.prototype[`levelset`] = (args, util) => {
        localStorage.setItem('plyr_lvl', args["lvl"])
    };

    blocks.push({
        opcode: `xpgiveexact`,
        blockType: Scratch.BlockType.COMMAND,
        text: `LEVELING: give player XP [xp]`,
        arguments: {
            "xp": {
                type: Scratch.ArgumentType.NUMBER,
                defaultValue: 0,
            },
        },
        disableMonitor: true
    });
    Extension.prototype[`xpgiveexact`] = (args, util) => {
        localStorage.setItem('plyr_xp', args["xp"])
    };

    blocks.push({
        opcode: `xpget`,
        blockType: Scratch.BlockType.REPORTER,
        text: `LEVELING: get player xp`,
        arguments: {},
        disableMonitor: true
    });
    Extension.prototype[`xpget`] = (args, util) => {
        return localStorage.getItem('plyr_xp')
    };

    blocks.push({
        opcode: `xpget_cond`,
        blockType: Scratch.BlockType.BOOLEAN,
        text: `LEVELING: player xp = [xpcond]`,
        arguments: {
            "xpcond": {
                type: Scratch.ArgumentType.NUMBER,
                defaultValue: 5,
            },
        },
        disableMonitor: true
    });
    Extension.prototype[`xpget_cond`] = (args, util) => {
        return (localStorage.getItem('plyr_xp') == args["xpcond"])
    };

    blocks.push({
        opcode: `xpget_cond_over`,
        blockType: Scratch.BlockType.BOOLEAN,
        text: `LEVELING: player xp > [xpcond]`,
        arguments: {
            "xpcond": {
                type: Scratch.ArgumentType.NUMBER,
                defaultValue: 5,
            },
        },
        disableMonitor: true
    });
    Extension.prototype[`xpget_cond_over`] = (args, util) => {
        return (localStorage.getItem('plyr_xp') > args["xpcond"])
    };

    blocks.push({
        opcode: `xpget_cond_under`,
        blockType: Scratch.BlockType.BOOLEAN,
        text: `LEVELING: player xp < [xpcond]`,
        arguments: {
            "xpcond": {
                type: Scratch.ArgumentType.NUMBER,
                defaultValue: 5,
            },
        },
        disableMonitor: true
    });
    Extension.prototype[`xpget_cond_under`] = (args, util) => {
        return (localStorage.getItem('plyr_xp') < args["xpcond"])
    };

    blocks.push({
        opcode: `clientidset`,
        blockType: Scratch.BlockType.COMMAND,
        text: `CLIENT: set client ID [id]`,
        arguments: {
            "id": {
                type: Scratch.ArgumentType.NUMBER,
                defaultValue: 0,
            },
        },
        disableMonitor: true
    });
    Extension.prototype[`clientidset`] = (args, util) => {
        localStorage.setItem('plyr_id', args["id"])
    };

    Scratch.extensions.register(new Extension());
})(Scratch);