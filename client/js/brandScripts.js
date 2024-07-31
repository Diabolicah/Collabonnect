function createOptionElement(value, text) {
    const option = document.createElement("option");
    option.value = value;
    option.text = text;
    return option;
}

async function populateBadgeImagesSelection() {
    const domain = await Settings.domain();
    const badgesData = await fetch(`${domain}/api/badges/images`).then((response) => response.json());
    const brandSelect = document.getElementById("collaboration_brand_data_list");
    const defaultOption = createOptionElement("", "Select a brand");
    defaultOption.selected = true;
    defaultOption.disabled = true;
    brandSelect.appendChild(defaultOption);
    for (let badge of badgesData) {
        const option = createOptionElement(badge, badge);
        brandSelect.appendChild(option);
    }
}

async function populateCollaborationContainer(){
    const collaborationCards = document.querySelectorAll(".collaboration_card");
    collaborationCards.forEach((card, index) => card.remove());

    const collaborations = await getCollaborationsList();
    collaborations.forEach(async (collaboration) => {
        if (collaboration.status != "Approved" && collaboration.status != "Rejected") {
            brandPageCollaborationCardBuilder(collaboration)
            .then(collaborationCard => {
                document.getElementById("collaboration_cards_container").appendChild(collaborationCard);
            });
        }
    });
}

async function populateBadgeContainer(){
    const domain = await Settings.domain();
    const badgeCards = document.querySelectorAll(".badge_card");
    badgeCards.forEach((card, index) => card.remove());

    const badgeContainer = document.getElementById("milestones_container");
    const badges = await fetch(`${domain}/api/badges/`).then((response) => response.json());
    badges.forEach(async (badge) => {
        const section = document.createElement("section");
        section.classList.add("badge_card");
        const img = document.createElement("img");
        img.src = `${domain}/assets/badgeImages/${badge.imageName}`;
        img.alt = badge.name;
        section.appendChild(img);
        badgeContainer.appendChild(section);
    });
}

function updateBrandPageTitle(brandName){
    const brandPageTitle = document.querySelector("#wrapper h1");
    brandPageTitle.textContent = brandName;
}

function nFormatter(num, digits) {
    const lookup = [
      { value: 1, symbol: "" },
      { value: 1e3, symbol: "k" },
      { value: 1e6, symbol: "M" },
      { value: 1e9, symbol: "G" },
      { value: 1e12, symbol: "T" },
      { value: 1e15, symbol: "P" },
      { value: 1e18, symbol: "E" }
    ];
    const regexp = /\.0+$|(?<=\.[0-9]*[1-9])0+$/;
    const item = lookup.findLast(item => num >= item.value);
    return item ? (num / item.value).toFixed(digits).replace(regexp, "").concat(item.symbol) : "0";
}

function updateBrandPageThreshold(threshold){
    const brandPageThreshold = document.querySelector("#threshold h2");
    brandPageThreshold.textContent = `Threshold: ${nFormatter(threshold, 2)}`;
}

function updateBrandPageLogo(logo){
    const brandPageLogo = document.querySelector("#brand_logo");
    brandPageLogo.src = logo;
}

window.onload = async () => {
    const userId = await Settings.userId();
    const brandData = await Data.brands();
    const currentBrand = brandData[userId];
    populateBadgeImagesSelection();
    populateBadgeContainer();

    updateBrandPageTitle(currentBrand.name);
    updateBrandPageThreshold(currentBrand.threshold);
    updateBrandPageLogo(currentBrand.image);

    populateCollaborationContainer();

    const objectAdder = document.getElementById("object_adder");
    objectAdder.addEventListener("click", () => {
        const newBadgeModal = new bootstrap.Modal('#new_badge_modal', {})
        newBadgeModal.show();
    });

    const informationButton = document.querySelector("#search_bar_container > img");
    informationButton.addEventListener("click", () => {
        const cardInformationModal = new bootstrap.Modal('#card_information_modal', {})
        cardInformationModal.show();
    });

    const newCollaborationForm = document.querySelector("#new_badge_modal form");
    const createCollaborationButton = document.getElementById("create_collaboration_button");
    const cancelCollaborationCreationButton = document.getElementById("cancel_collaboration_creation_button");

    createCollaborationButton.addEventListener("click", async () => {
        document.querySelector("#new_badge_modal form > input").click();
    });

    newCollaborationForm.addEventListener("submit", async (event) => {
        event.preventDefault();
        const formData = new FormData(newCollaborationForm);
        const { domain, userId} = await fetch("./data/settings.json").then((response) => response.json());
        formData.append("userId", userId);
        formData.append("brandId", userId);
        const requestData = JSON.stringify(Object.fromEntries(formData));
        const response = await fetch(`${domain}/api/badges/`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: requestData
        });

        if(response.status == 201){
            cancelCollaborationCreationButton.click();
            newCollaborationForm.reset();
            populateBadgeContainer();
        }
    });
}