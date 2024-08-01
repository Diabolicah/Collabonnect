let _userInfo = {
    isReady: false,
    isProcessing: false,
};

let userInfo = async () => {
    if (!_userInfo.isReady) {
        if (!_userInfo.isProcessing) {
            await getUserData();
        }
        else {
            while (!_userInfo.isReady) {
                await new Promise(resolve => setTimeout(resolve, 100));
            }
        }
    }
    return _userInfo._data;
}

async function getUserData() {
    _userInfo.isProcessing = true;
    const userData = await getUserInfo();
    _userInfo.isReady = true;
    return userData;
}

async function getUserInfo() {
    if (!sessionStorage.getItem("userAccessToken")) {
        window.location.href = "/login.html";
    } else {
        const domain = await Settings.domain();
        const userAccessToken = sessionStorage.getItem("userAccessToken");
        await fetch(`${domain}/api/users/`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                userAccessToken
            })
        }).then((response) => response.json()).then((response) => {
            if (response.error) {
                window.location.href = "/login.html";
            } else {
                _userInfo._data = response;
            }
        });
    }
}