function updateNavbarDetails(details) {
    const user_details_image = document.getElementById("user_details_image");
    user_details_image.src = details.profile_image;
    const user_details_userName = document.getElementById("user_details_userName");
    user_details_userName.textContent = details.first_name;
    const user_details_rank = document.getElementById("user_details_rank");
    user_details_rank.textContent = details.rank;
    const user_details_token = document.getElementById("user_details_token");
    user_details_token.textContent = details.token;
    const progress_bar = document.querySelector("#user_details .progress-bar.bg-light");
    progress_bar.style.width = `${Math.min(Math.max(details.experience, 0), 100)}%`;
}

function updateActiveNavbarTab(tabList) {
    const active_tabs = document.querySelectorAll(".active_nav");
    active_tabs.forEach((active_tab) => active_tab.classList.remove("active_nav"));
    tabList.forEach((tab) => tab.classList.add("active_nav"));
}

(async function() {
    const domain = await Settings.domain();
    const user_id = await Settings.user_id();
    const nav_bar_user_details = await fetch(`${domain}/api/user/${user_id}`).then(response => response.json());
    nav_bar_user_details.profile_image = `${domain}/assets/profile_images/${nav_bar_user_details.profile_image}`;
    updateNavbarDetails(nav_bar_user_details);

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