function createOptionElement(value, text) {
    const option = document.createElement("option");
    option.value = value;
    option.text = text;
    return option;
}

async function populateBadgeImagesSelection() {
    const domain = await Settings.domain();
    const badgesData = await fetch(`${domain}/api/badges/images`).then((response) => response.json());
    const brandSelect = document.getElementById("badge_data_list");
    const defaultOption = createOptionElement("", "Select a brand");
    defaultOption.selected = true;
    defaultOption.disabled = true;
    brandSelect.appendChild(defaultOption);
    for (let badge of badgesData) {
        const option = createOptionElement(badge, badge);
        brandSelect.appendChild(option);
    }

    brandSelect.addEventListener("change", async (event) => {
        const selectedBadge = event.target.value;
        const brandImage = document.getElementById("badge_image");
        brandImage.src = `${domain}/assets/badgeImages/${selectedBadge}`;
    });
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

async function OnBadgeClick(badgeInfo, imgSrc){
    const badgeInformationModal = new bootstrap.Modal('#badge_information_modal', {});
    badgeInformationModal.show();
    const badgeNameSpan = document.getElementById("information_badge_name");
    const badgeDescriptionSpan = document.getElementById("information_badge_description");
    const badgeImage = document.getElementById("information_badge_image");
    badgeNameSpan.textContent = badgeInfo.name;
    badgeDescriptionSpan.textContent = badgeInfo.description;
    badgeImage.src = imgSrc;

    const cancelBadgeDeletionButton = document.getElementById("cancel_badge_deletion_button");
    const deleteBadgeButton = document.getElementById("delete_badge_button");


    const deleteBadgeFunc = async (event) => {
        event.stopPropagation();
        const domain = await Settings.domain();
        const response = await fetch(`${domain}/api/badges/${badgeInfo.id}`, {
            method: "DELETE"
        });

        if(response.status == 204){
            cancelBadgeDeletionButton.click();
            populateBadgeContainer();
        }
    }

    const hideBadgeInformationModal = (event) => {
        event.stopPropagation();
        badgeInformationModal.hide();
    }

    deleteBadgeButton.addEventListener("click", deleteBadgeFunc);
    cancelBadgeDeletionButton.addEventListener("click", hideBadgeInformationModal);

    badgeInformationModal._element.addEventListener("hide.bs.modal", () => {
        deleteBadgeButton.removeEventListener("click", deleteBadgeFunc);
        cancelBadgeDeletionButton.removeEventListener("click", hideBadgeInformationModal);
    });
}

async function onThresholdEditClick(event){
    const userId = await Settings.userId();
    const thresholdModal = new bootstrap.Modal('#threshold_change_modal', {});
    const thresholdInput = document.getElementById("threshold_input");
    const brandData = await Data.brands();
    const currentBrand = brandData[userId];
    const threshold = currentBrand.threshold;
    thresholdInput.value = threshold;
    thresholdModal.show();

    const cancelThresholdChangeButton = document.getElementById("cancel_threshold_update_button");
    const saveThresholdChangeButton = document.getElementById("threshold_update_button");

    const hideThresholdChangeModal = (event) => {
        event.stopPropagation();
        thresholdModal.hide();
    }

    const updateThreshold = async (event) => {
        event.stopPropagation();
        const domain = await Settings.domain();
        const requestData = JSON.stringify({threshold: thresholdInput.value});
        const response = await fetch(`${domain}/api/brands/${userId}/threshold`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json"
            },
            body: requestData
        });

        if(response.status == 200){
            hideThresholdChangeModal(event);
            updateBrandPageThreshold(thresholdInput.value);
            await getBrandsData();
        }
    }

    saveThresholdChangeButton.addEventListener("click", updateThreshold);
    cancelThresholdChangeButton.addEventListener("click", hideThresholdChangeModal);

    thresholdModal._element.addEventListener("hide.bs.modal", () => {
        saveThresholdChangeButton.removeEventListener("click", updateThreshold);
        cancelThresholdChangeButton.removeEventListener("click", hideThresholdChangeModal);
    });
}

async function onlyAllowPositiveIntegers(event){
    const input = event.target;
    const value = input.value;
    const newValue = value.replace(/\D/g, "");
    input.value = newValue;
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
        img.addEventListener("click", ()=> OnBadgeClick(badge, img.src));
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

function setupAddBadgeModal(){
    const newBadgeForm = document.querySelector("#new_badge_modal form");
    const createBadgeButton = document.getElementById("create_badge_button");
    const cancelBadgeCreationButton = document.getElementById("cancel_badge_creation_button");

    createBadgeButton.addEventListener("click", async () => {
        document.querySelector("#new_badge_modal form > input").click();
    });

    newBadgeForm.addEventListener("submit", async (event) => {
        event.preventDefault();
        const formData = new FormData(newBadgeForm);
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
            cancelBadgeCreationButton.click();
            newBadgeForm.reset();
            populateBadgeContainer();
        }
    });
}

window.onload = async () => {
    const userId = await Settings.userId();
    const brandData = await Data.brands();
    const currentBrand = brandData[userId];
    
    const editThresholdButton = document.querySelector("#threshold img");
    editThresholdButton.addEventListener("click", onThresholdEditClick);

    const thresholdInput = document.getElementById("threshold_input");
    thresholdInput.addEventListener("input", onlyAllowPositiveIntegers);

    const searchInput = document.getElementById("search_bar");
    searchInput.addEventListener("input", filterCollaborationsOnSearch);

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

    setupAddBadgeModal();
}