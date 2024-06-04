<p align="center">
  <img height="80px" width="80px" src="https://file.strassburger.dev/discordrp.png" alt="logo">
  <h3 align="center">Discord RP Manager</h3>

  <p align="center">Discord Rich Presence Manager for MacOS</p>
</p>

## Installation

### Easy way:

Go to the [Releases](https://github.com/KartoffelChipss/rp-manager-discord/releases), download the latest installer for your OS and install it.

### Little bit harder way:

You need to have Node.js, npm and git installed.

Clone this repository:
```
git clone https://github.com/KartoffelChipss/rp-manager-discord
```
Move to the apps directory, install all dependencies and start the app:
```
cd rp-manager-discord
npm install
npm run start
```
If you want to build an installer yourself use one of the following commands:
- MacOS: `npm run dist:mac`
- Linux: `npm run dist:linux`
- Windows: `npm run dist:win`

## Common Errors

### Discord RP Manager is damaged and can’t be opened. You should move it to the trash

This message is shown, because the app gets the `com.apple.Quarantine` tag when downloaded from a source, that Apple doesn't like.

```
xattr -c /Applications/Discord\ RP\ Manager.app
```

## License

[GNU General Public License v3.0](https://github.com/KartoffelChipss/rp-manager-discord/blob/main/LICENSE)
