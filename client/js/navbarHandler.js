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

(async () => {
    const {nav_bar_domain, nav_bar_user_id} = await fetch("./data/settings.json")
    .then((response) => response.json());

    const user_details = await fetch(`${nav_bar_domain}/api/user/${nav_bar_user_id}`)
    .then(response => response.json());
    user_details.profile_image = `${nav_bar_domain}/assets/profile_images/${user_details.profile_image}`;
    updateNavbarDetails(user_details);
})();