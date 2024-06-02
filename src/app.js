const { app, BrowserWindow, shell, nativeImage, nativeTheme, Tray, Menu } = require("electron");
const { ipcMain } = require("electron/main");
const logger = require("electron-log");
const path = require("path");
const Store = require("electron-store");
const fs = require("fs");
const { login, getUser } = require("./utils/rpcManager");

const devMode = process.env.NODE_ENV === 'development';

const appName = "Discord RP Manager"
const appRoot = path.join(`${app.getPath("appData") ?? "."}${path.sep}.dcRP`);
if (!fs.existsSync(appRoot)) fs.mkdirSync(appRoot, { recursive: true });

const appIcon = process.platform === "win32" ? path.join(__dirname + "/public/assets/logo.ico") :
    process.platform === "darwin" ? path.join(__dirname + "/public/assets/logo.png") :
        path.join(__dirname + "/public/assets/logo.png");

logger.transports.file.resolvePathFn = () => path.join(appRoot, "logs.log");
logger.transports.file.level = "info";

logger.info(" ");
logger.info("=== APP STARTED ===");
logger.info(" ");
if (devMode) {
    logger.info("[DEV] Started in DEVMODE");
    logger.info(" ");
}

const store = new Store();

if (devMode) store.openInEditor();

let top = {};

const gotTheLock = app.requestSingleInstanceLock();

if (!gotTheLock) {
    app.quit();
} else {
    app.on("second-instance", (event, commandLine, workingDirectory) => {
        if (top.mainWindow) {
            logger.info("[APP] Tried to start second instance.");
            top.mainWindow.show();
            if (top.mainWindow.isMinimized()) top.mainWindow.restore();
            top.mainWindow.focus();
        }
    });

    app.whenReady().then(async () => {
        logger.info("[APP] App ready!");

        if (process.platform === "win32") {
            app.setAppUserModelId(appName);
        }

        if (process.platform === "darwin") {
            app.dock.setIcon(nativeImage.createFromPath(path.join(__dirname + "/public/assets/logo.png")));
        }

        initTray();

        ipcMain.handle("update", (event, data) => {
            logger.info("Recieved Update:", data);
            store.set("data", data);
            login(data.appid);
        });

        ipcMain.handle("getData", (event, args) => {
            console.log("Data from store:", store.get("data"));
            return store.get("data");
        });

        ipcMain.handle("refreshLogin", (event, appid) => {
            login(appid);
        });

        ipcMain.handle("getUser", (event, appid) => {
            return getUser();
        });

        ipcMain.handle("openURL", (event, url) => {
            shell.openExternal(url);
        });

        login(store.get("data.appid"));

        newWindow();
    });
}

app.on('window-all-closed', () => {
    return;
});

function newWindow() {
    top.mainWindow = createMainWindow();

    top.mainWindow.loadFile("src/public/main.html").then(() => {
        top.mainWindow.show();
    });

    top.mainWindow.on("close", () => {
        const bounds = top.mainWindow.getBounds();
        top.mainWindow = null;
        store.set("windowPosition", bounds);
    });
}

/**
 * Create the main window
 * @returns {BrowserWindow} - The main window
 */
function createMainWindow() {
    const lastPos = store.get("windowPosition");

    console.log("Setting icon to: ", appIcon);

    return new BrowserWindow({
        title: appName,
        width: lastPos ? lastPos.width : 1200,
        height: lastPos ? lastPos.height : 800,
        minWidth: 750,
        minHeight: 500,
        x: lastPos ? lastPos.x : undefined,
        y: lastPos ? lastPos.y : undefined,
        center: true,
        frame: true,
        show: false,
        backgroundColor: "#1A1B1E",
        resizable: true,
        autoHideMenuBar: false,
        icon: appIcon,
        webPreferences: {
            preload: path.join(__dirname, "preload.js"),
            nodeIntegration: false,
            contextIsolation: true,
        },
    });
}

function initTray() {
    const isMac = process.platform === 'darwin';

    let iconColor = "black";
    if (nativeTheme.shouldUseDarkColors) iconColor = "white";

    top.tray = null;

    let preferredIconType = "ico";

    if (process.platform === "darwin" || process.platform === "linux") preferredIconType = "png";

    if (!isMac) {
        top.tray = new Tray(path.join(appRoot + `/public/img/logo.${preferredIconType}`));

        let menu = [
            {
                label: getLang(app.getLocale(), "tray_help_title") ?? "Help",
                icon: nativeImage.createFromPath(appRoot + `/public/img/icons/${iconColor}/help.${preferredIconType}`).resize({ width: 16 }),
                click: (item, window, event) => {
                    shell.openExternal("https://strassburger.org/discord");
                },
            },
            {
                type: "separator",
            },
            {
                label: getLang(app.getLocale(), "tray_home_title") ?? "Home",
                icon: nativeImage.createFromPath(appRoot + `/public/img/icons/${iconColor}/home.${preferredIconType}`).resize({ width: 16 }),
                click: (item, window, event) => {
                    top.mainWindow.show();
                    top.mainWindow.webContents.send("openSection", "main");
                },
            },
            {
                label: getLang(app.getLocale(), "tray_settings_title") ?? "Settings",
                icon: nativeImage.createFromPath(appRoot + `/public/img/icons/${iconColor}/settings.${preferredIconType}`).resize({ width: 16 }),
                click: (item, window, event) => {
                    top.mainWindow.show();
                    top.mainWindow.webContents.send("openSection", "settings");
                },
            },
            {
                label: getLang(app.getLocale(), "tray_settings_about") ?? "About",
                icon: nativeImage.createFromPath(appRoot + `/public/img/icons/${iconColor}/about.${preferredIconType}`).resize({ width: 16 }),
                click: (item, window, event) => {
                    // aboutWindowManager.show();
                },
            },
            {
                type: "separator",
            },
            {
                label: getLang(app.getLocale(), "tray_quit_title") ?? "Quit",
                icon: nativeImage.createFromPath(appRoot + `/public/img/icons/${iconColor}/off.${preferredIconType}`).resize({ width: 16 }),
                role: "quit",
            },
        ];

        const builtmenu = Menu.buildFromTemplate(menu);
        top.tray.setContextMenu(builtmenu);

        top.tray.setToolTip(appName);

        top.tray.on("click", function (e) {
            if (top.mainWindow.isVisible()) {
                top.mainWindow.hide();
            } else {
                top.mainWindow.show();
            }
        });
    }

    const appMenuTemplate = [
        {
            label: "BlueKnight",
            submenu: [
                {
                    label: "About",
                    accelerator: 'CmdOrCtrl+I',
                    click: (item, window, event) => {
                        aboutWindowManager.show();
                    },
                },
                {
                    type: "separator",
                },
                {
                    label: "Home",
                    accelerator: 'CmdOrCtrl+Shift+H',
                    click: (item, window, event) => {
                        top.mainWindow.show();
                        top.mainWindow.webContents.send("openSection", "main");
                    },
                },
                {
                    label: "Settings",
                    accelerator: 'CmdOrCtrl+Shift+S',
                    click: (item, window, event) => {
                        top.mainWindow.show();
                        top.mainWindow.webContents.send("openSection", "settings");
                    },
                },
                {
                    label: "Addons",
                    accelerator: 'CmdOrCtrl+Shift+A',
                    click: (item, window, event) => {
                        top.mainWindow.show();
                        top.mainWindow.webContents.send("openSection", "mods");
                    },
                },
                {
                    type: "separator",
                },
                { role: 'hide' },
                { role: 'hideothers' },
                { role: 'unhide' },
                {
                    type: "separator",
                },
                {
                    label: "Quit",
                    role: "quit",
                },
            ]
        },
        {
            label: 'File',
            submenu: [
                {
                    label: 'New Window',
                    accelerator: 'CmdOrCtrl+N',
                    click: () => {
                        if (!top.mainWindow) newWindow();
                    }
                },
                isMac? { role: 'close' } : { role: 'quit' }
            ]
        },
        {
            label: 'Edit',
            submenu: [
                { role: 'undo' },
                { role: 'redo' },
                { type: 'separator' },
                { role: 'cut' },
                { role: 'copy' },
                { role: 'paste' },
                ...(isMac ? [
                    { role: 'pasteAndMatchStyle' },
                    { role: 'delete' },
                    { role: 'selectAll' },
                    { type: 'separator' },
                    {
                        label: 'Speech',
                        submenu: [
                            { role: 'startspeaking' },
                            { role: 'stopspeaking' }
                        ]
                    }
                ] : [
                    { role: 'delete' },
                    { type: 'separator' },
                    { role: 'selectAll' }
                ])
            ]
        },
        // { role: 'viewMenu' }
        {
            label: 'View',
            submenu: [
                { role: 'reload' },
                { role: 'forcereload' },
                { role: 'toggledevtools' },
                { type: 'separator' },
                { role: 'resetzoom' },
                { role: 'zoomin' },
                { role: 'zoomout' },
                { type: 'separator' },
                { role: 'togglefullscreen' }
            ]
        },
        {
            role: 'help',
            submenu: [
                {
                    label: 'GitHub',
                    click: async () => {
                        shell.openExternal('https://github.com/KartoffelChipss/blueknight');
                    }
                },
                {
                    label: 'Discord',
                    click: async () => {
                        shell.openExternal('https://strassburger.org/discord');
                    }
                }
            ]
        }
    ];

    const appMenu = Menu.buildFromTemplate(appMenuTemplate);
    Menu.setApplicationMenu(appMenu);

    logger.info("[STARTUP] Set up tray menu");
}