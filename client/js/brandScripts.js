async function populateCollaborationContainer(){
    const collaborationCards = document.querySelectorAll(".collaboration_card");
    collaborationCards.forEach((card, index) => card.remove());

    const collaborations = await getCollaborationsList();
    collaborations.forEach(async (collaboration) => {
        homePageCollaborationCardBuilder(collaboration)
            .then(collaboration_card => {
                document.getElementById("collaboration_cards_container").appendChild(collaboration_card);
            });
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
    const user_id = await Settings.user_id();
    const BrandData = await Data.brands();
    const currentBrand = BrandData[user_id];

    updateBrandPageTitle(currentBrand.name);
    updateBrandPageThreshold(currentBrand.threshold);
    updateBrandPageLogo(currentBrand.image);

    populateCollaborationContainer();

    // const object_adder = document.getElementById("object_adder");
    // object_adder.addEventListener("click", () => {
    //     const newCollaborationModal = new bootstrap.Modal('#newCollaborationModal', {})
    //     newCollaborationModal.show();
    // });

    const information_button = document.querySelector("#search_bar_container > img");
    information_button.addEventListener("click", () => {
        const newCollaborationModal = new bootstrap.Modal('#cardInformationModal', {})
        newCollaborationModal.show();
    });

    // const newCollaborationForm = document.querySelector("#newCollaborationModal form");
    // const createCollaborationButton = document.getElementById("createCollaborationButton");
    // const cancelCollaborationCreationButton = document.getElementById("cancelCollaborationCreationButton");

    // createCollaborationButton.addEventListener("click", async () => {
    //     document.querySelector("#newCollaborationModal form > input").click();
    // });

    // newCollaborationForm.addEventListener("submit", async (event) => {
    //     event.preventDefault();
    //     const formData = new FormData(newCollaborationForm);
    //     const { domain, user_id} = await fetch("./data/settings.json").then((response) => response.json());
    //     formData.append("user_id", user_id)
    //     const requestData = JSON.stringify(Object.fromEntries(formData));
    //     const response = await fetch(`${domain}/api/collaboration/`, {
    //         method: "POST",
    //         headers: {
    //             "Content-Type": "application/json"
    //         },
    //         body: requestData
    //     });

    //     if(response.status == 201){
    //         cancelCollaborationCreationButton.click();
    //         newCollaborationForm.reset();
    //         populateCollaborationContainer();
    //     }
    // });
}