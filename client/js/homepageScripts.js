function createOptionElement(value, text) {
    const option = document.createElement("option");
    option.value = value;
    option.text = text;
    return option;
}

async function updateFormBrandSearch(event) {
    const brandSelect = event.target;
    const brandName = document.getElementById("collaboration_brand_data_name");
    const brandImage = document.getElementById("collaboration_brand_data_logo");
    if (brandSelect.value == "") {
        brandName.textContent = "";
        brandImage.src = "images/image_placeholder.svg";
        return;
    }
    const search = await fetch(`https://api.brandfetch.io/v2/search/${brandSelect.value}`).then(response => response.json());
    if (search.length == 0) {
        brandName.textContent = "Brand not found";
        brandImage.src = "images/image_placeholder.svg";
        brandSelect.setCustomValidity("Brand not found");
        return;
    }
    const information = search[0];
    if (information) {
        brandName.textContent = information.name;
        brandImage.src = information.icon;
        brandSelect.setCustomValidity("");
    }
}

async function updateFormDeveloperSearch(event) {
    const developerSelect = event.target;
    const developerName = document.getElementById("collaboration_developer_data_name");
    const developerImage = document.getElementById("collaboration_developer_data_logo");
    if (developerSelect.value == "") {
        developerName.textContent = "";
        developerImage.src = "images/image_placeholder.svg";
        return;
    }
    const search = await fetch(`https://api.brandfetch.io/v2/search/${developerSelect.value}`).then(response => response.json());
    if (search.length == 0) {
        developerName.textContent = "Developer not found";
        developerImage.src = "images/image_placeholder.svg";
        developerSelect.setCustomValidity("Developer not found");
        return;
    }
    const information = search[0];
    if (information) {
        developerName.textContent = information.name;
        developerImage.src = information.icon;
        developerSelect.setCustomValidity("");
    }
}

async function populateCollaborationContainer(){
    const collaborationCards = document.querySelectorAll(".collaboration_card");
    collaborationCards.forEach((card, index) => card.remove());

    const collaborations = await getCollaborationsList();
    collaborations.forEach(async (collaboration) => {
        homePageCollaborationCardBuilder(collaboration)
            .then(collaborationCard => {
                document.getElementById("collaboration_cards_container").appendChild(collaborationCard);
            });
    });
}

window.onload = async () => {
    const domain = await Settings.domain();
    const userId = await Settings.userId();

    const searchInput = document.getElementById("search_bar");
    searchInput.addEventListener("input", filterCollaborationsOnSearch);

    populateCollaborationContainer();

    const brandSelect = document.getElementById("collaboration_brand_data_search");
    brandSelect.addEventListener("change", updateFormBrandSearch);

    const developerSelect = document.getElementById("collaboration_developer_data_search");
    developerSelect.addEventListener("change", updateFormDeveloperSearch);

    const object_adder = document.getElementById("object_adder");
    object_adder.addEventListener("click", () => {
        const newCollaborationModal = new bootstrap.Modal('#new_collaboration_modal', {})
        newCollaborationModal.show();
    });

    const information_button = document.querySelector("#search_bar_container > img");
    information_button.addEventListener("click", () => {
        const newCollaborationModal = new bootstrap.Modal('#card_information_modal', {})
        newCollaborationModal.show();
    });

    const newCollaborationForm = document.querySelector("#new_collaboration_modal form");
    const createCollaborationButton = document.getElementById("create_collaboration_button");
    const cancelCollaborationCreationButton = document.getElementById("cancel_collaboration_creation_button");

    createCollaborationButton.addEventListener("click", async () => {
        document.querySelector("#new_collaboration_modal form > input").click();
    });

    newCollaborationForm.addEventListener("submit", async (event) => {
        event.preventDefault();
        const formData = new FormData(newCollaborationForm);
        formData.append("userId", userId)
        const requestData = JSON.stringify(Object.fromEntries(formData));
        const response = await fetch(`${domain}/api/collaborations/`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: requestData
        });

        if(response.status == 201){
            cancelCollaborationCreationButton.click();
            newCollaborationForm.reset();
            await getBrandsData();
            await getDevelopersData();
            populateCollaborationContainer();
        }
    });
}