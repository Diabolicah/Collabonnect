let userInfo = {};

async function getUserInfo() {
    if (!sessionStorage.getItem("userAccessToken")) {
        window.location.href = "/login.html";
    } else {
        const userAccessToken = sessionStorage.getItem("userAccessToken");
        const response = await fetch(`/api/users/${userAccessToken}`);
        userInfo = await response.json();
    }
}

async function logout() {
    sessionStorage.removeItem("userAccessToken");
    window.location.href = "/login.html";
}