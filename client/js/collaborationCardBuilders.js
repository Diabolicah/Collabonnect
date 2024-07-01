function createCollaborationCardTitle(title) {
    const collaboration_card_title = document.createElement("h2");

    collaboration_card_title.textContent = title;
    return collaboration_card_title;
}

function createCollaborationCardLogo(logo, altName) {
    const collaboration_card_logo = document.createElement("img");
    collaboration_card_logo.src = logo;
    collaboration_card_logo.alt = altName;
    return collaboration_card_logo;
}

function createCollaborationCardLogos(developerLogo, brandLogo) {
    const collaboration_card_logos = document.createElement("section");
    collaboration_card_logos.appendChild(createCollaborationCardLogo(developerLogo, "developer_image"));
    collaboration_card_logos.appendChild(createCollaborationCardLogo(brandLogo, "brand_image"));
    return collaboration_card_logos;
}

function createCollaborationCardDetails(upvoteAmount, downvoteAmount, ai_readabilityPercentage) {
    const collaboration_card_details = document.createElement("section");
    collaboration_card_details.className = "collaboration_card_details";
    if (upvoteAmount) {
        const collaboration_card_upvote = document.createElement("section");
        const img = document.createElement("img");
        img.src = "./images/thumbs_up_black.svg";
        img.alt = "upvote_icon";
        collaboration_card_upvote.appendChild(img);
        const span = document.createElement("span");
        span.textContent = upvoteAmount;
        collaboration_card_upvote.appendChild(span);
        collaboration_card_details.appendChild(collaboration_card_upvote);
    }

    if (downvoteAmount) {
        const collaboration_card_downvote = document.createElement("section");
        const img = document.createElement("img");
        img.src = "./images/thumbs_down_black.svg";
        img.alt = "downvote_icon";
        collaboration_card_downvote.appendChild(img);
        const span = document.createElement("span");
        span.textContent = downvoteAmount;
        collaboration_card_downvote.appendChild(span);
        collaboration_card_details.appendChild(collaboration_card_downvote);
    }

    if (ai_readabilityPercentage) {
        const collaboration_card_ai_readability = document.createElement("section");
        const img = document.createElement("img");
        img.src = "./images/ai_icon.svg";
        img.alt = "ai_icon";
        collaboration_card_ai_readability.appendChild(img);
        const span = document.createElement("span");
        span.textContent = ai_readabilityPercentage;
        collaboration_card_ai_readability.appendChild(span);
        collaboration_card_details.appendChild(collaboration_card_ai_readability);
    }

    return collaboration_card_details;
}

function createCollaborationCardCircularProgressBar(percentage) {
    const section = document.createElement("section");
    section.className = "circular_progress_bar";
    section.role = "progressbar";
    updateCircularProgressBar(section, percentage)

    const span = document.createElement("span");
    span.textContent = `${percentage}`;
    section.appendChild(span);

    return section;
}

async function homePageCollaborationCardBuilder(details) {
    const { id, title, description, upvote, downvote, status, ai_readability } = details;
    const {brandLogo, developerLogo} = await getCollaborationLogos({brand_id: details.brand_id, developer_id: details.developer_id});
    const collaboration_card = document.createElement("section");
    collaboration_card.className = "collaboration_card";

    const first_section = document.createElement("section");
    first_section.appendChild(createCollaborationCardTitle(title));
    first_section.appendChild(createCollaborationCardLogos(developerLogo, brandLogo));
    collaboration_card.appendChild(first_section);

    collaboration_card.appendChild(createCollaborationCardDetails(upvote, downvote, ai_readability));

    const third_section = document.createElement("section");
    const descriptionParagraph = document.createElement("p");
    descriptionParagraph.textContent = description;
    third_section.appendChild(descriptionParagraph);
    collaboration_card.appendChild(third_section);

    const fourth_section = document.createElement("section");
    const collaboration_card_status = document.createElement("section");
    const status_span = document.createElement("span");
    status_span.textContent = `Status: ${status}`;
    collaboration_card_status.appendChild(status_span);
    fourth_section.appendChild(collaboration_card_status);

    const circular_progress_bar = createCollaborationCardCircularProgressBar(getCollaborationThresholdPercentage(details));
    fourth_section.appendChild(circular_progress_bar);
    collaboration_card.appendChild(fourth_section);

    const fifth_section = document.createElement("section");
    const last_edit_span = document.createElement("span");
    last_edit_span.textContent = `Last Edit: `;
    fifth_section.appendChild(last_edit_span);

    const lower_button_section = document.createElement("section");
    const delete_img = document.createElement("img");
    delete_img.src = "./images/delete_icon_black.svg";
    delete_img.alt = "delete_icon";
    lower_button_section.appendChild(delete_img);

    const edit_img = document.createElement("img");
    edit_img.src = "./images/edit_icon_black.svg";
    edit_img.alt = "edit_icon";
    lower_button_section.appendChild(edit_img);

    fifth_section.appendChild(lower_button_section);
    collaboration_card.appendChild(fifth_section);

    collaboration_card.addEventListener("click", () => {
        window.location.href = `./objectDetails.html?id=${id}`;
    });

    edit_img.addEventListener("click", (event) => {
        event.stopPropagation();
        window.location.href = `../objectDetails.html?id=${id}&edit=true`;
    });

    delete_img.addEventListener("click", (event) => {
        event.stopPropagation();
    });

    return collaboration_card;
}

homePageCollaborationCardBuilder({
    id: 1,
    title: "Sample Title",
    description: "Sample Description",
    upvote: 10,
    downvote: 5,
    status: "Pending",
    ai_readability: 90,
    brand_id: 1,
    developer_id: 1
}).then(collaboration_card => console.log(collaboration_card));