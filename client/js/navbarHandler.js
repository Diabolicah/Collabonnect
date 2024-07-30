function updateNavbarDetails(details) {
    const userDetailsImage = document.getElementById("user_details_image");
    userDetailsImage.src = details.profileImage;
    const userDetailsUserName = document.getElementById("user_details_user_name");
    userDetailsUserName.textContent = details.firstName;
    const userDetailsRank = document.getElementById("user_details_rank");
    userDetailsRank.textContent = details.rank;
    const userDetailsToken = document.getElementById("user_details_token");
    userDetailsToken.textContent = details.token;
    const progressBar = document.querySelector("#user_details .progress-bar.bg-light");
    progressBar.style.width = `${Math.min(Math.max(details.experience, 0), 100)}%`;
}

function updateActiveNavbarTab(tabList) {
    const activeTabs = document.querySelectorAll(".active_nav");
    activeTabs.forEach((activeTabs) => activeTabs.classList.remove("active_nav"));
    tabList.forEach((tab) => tab.classList.add("active_nav"));
}

(async () => {
    const domain = await Settings.domain();
    const userId = await Settings.userId();
    const navBarUserDetails = await fetch(`${domain}/api/users/${userId}`).then(response => response.json());
    navBarUserDetails.profileImage = `${domain}/assets/profileImages/${navBarUserDetails.profileImage}`;
    updateNavbarDetails(navBarUserDetails);

    const searchParams = new URLSearchParams(window.location.search);
    if (searchParams.get("fromPage") == "Vote") {
        let voteTabList = document.querySelectorAll("nav a:nth-child(2)");
        updateActiveNavbarTab(voteTabList);
    }

    if (searchParams.get("fromPage") == "Brand") {
        let voteTabList = document.querySelectorAll("nav a:nth-child(4)");
        updateActiveNavbarTab(voteTabList);
    }
})();