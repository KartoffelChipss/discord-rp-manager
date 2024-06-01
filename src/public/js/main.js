function gv(id) {
    return document.getElementById(id).value;
}

window.api.invoke("getData").then(data => {
    console.log(`Recieved data:`, data);

    document.getElementById("appid").value = data.appid;
    document.getElementById("line1").value = data.line1;
    document.getElementById("line2").value = data.line2;
    document.getElementById("largeImgUrl").value = data.largeImgUrl;
    document.getElementById("largeImgText").value = data.largeImgText;
    document.getElementById("smallImgUrl").value = data.smallImgUrl;
    document.getElementById("smallImgText").value = data.smallImgText;
    document.getElementById("buttonText1").value = data.buttonText1;
    document.getElementById("buttonURL1").value = data.buttonURL1;
    document.getElementById("buttonText2").value = data.buttonText2;
    document.getElementById("buttonURL2").value = data.buttonURL2;

    document.getElementById("prev_line1").innerHTML = data.line1;
    document.getElementById("prev_line2").innerHTML = data.line2;
    document.getElementById("largeImage").src = data.largeImgUrl;
    document.getElementById("smallImage").src = data.smallImgUrl;
});

async function refreshLogin(appid) {
    await window.api.invoke("refreshLogin", appid);
    updateUser();
}

function sendUpdate() {
    window.api.invoke("update", {
        appid: gv("appid"),
        line1: gv("line1"),
        line2: gv("line2"),
        largeImgUrl: gv("largeImgUrl"),
        largeImgText: gv("largeImgText"),
        smallImgUrl: gv("smallImgUrl"),
        smallImgText: gv("smallImgText"),
        buttonText1: gv("buttonText1"),
        buttonURL1: gv("buttonURL1"),
        buttonText2: gv("buttonText2"),
        buttonURL2: gv("buttonURL2"),
    });

    document.getElementById("prev_line1").innerHTML = gv("line1");
    document.getElementById("prev_line2").innerHTML = gv("line2");
    document.getElementById("largeImage").src = gv("largeImgUrl");
    document.getElementById("smallImage").src = gv("smallImgUrl");
}

async function updateUser() {
    const user = await window.api.invoke("getUser");
    console.log("User", user);

    document.querySelector(".uname").innerHTML = user.global_name;
    document.querySelector(".avatar").src = `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}`
}

setInterval(async () => {
    updateUser();
}, 1000)

updateUser();

document.querySelectorAll("input").forEach(input => {
    input.addEventListener("input", (event) => {
        sendUpdate();
    });
});