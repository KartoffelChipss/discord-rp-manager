const Store = require("electron-store");
const RPC = require("discord-rpc");
const Logger = require("electron-log");

const store = new Store();

let clientID = null;
let user = null;

/**
 * @type {import('discord-rpc').Client}
 */
let rpc = new RPC.Client({ transport: 'ipc' });

function login(clientid) {
    if (clientID === clientid) return;
    clientID = null;
    Logger.info(`Logging in with id ${clientid}`);
    rpc.login({ clientId: clientid })
        .catch(err => {
            Logger.error(err);
        })
        .then(() => {
            Logger.info(`Logged in to ${rpc.user?.username}`);
            if (rpc.user) {
                clientID = clientid;
                user = rpc.user;
            }
        })
}

function getUser() {
    return user;
}

rpc.on("ready", () => {
    Logger.info("RPC ready!");
    setActivity(store.get("data"));

    setInterval(() => {
        setActivity(store.get("data"));
    }, 15e3);
});

async function setActivity(data) {
    if (!rpc || !data) return;

    Logger.info("Updating Activity...");

    const btns = [];

    if (data.buttonText1 && data.buttonURL1) {
        btns.push({
            label: data.buttonText1,
            url: data.buttonURL1,
        });
    }

    if (data.buttonText2 && data.buttonURL2) {
        btns.push({
            label: data.buttonText2,
            url: data.buttonURL2,
        });
    }

    rpc.setActivity({
        details: undefinedIfEmpty(data.line1),
        state: undefinedIfEmpty(data.line2),
        largeImageKey: undefinedIfEmpty(data.largeImgUrl),
        largeImageText: undefinedIfEmpty(data.largeImgText),
        smallImageKey: undefinedIfEmpty(data.smallImgUrl),
        smallImageText: undefinedIfEmpty(data.smallImgText),
        buttons: btns,
    });

    Logger.info("Updated Activity!");
}

function undefinedIfEmpty(str) {
    if (!str || str.length === 0) return undefined
    else return str
}

module.exports = {
    login,
    getUser,
}