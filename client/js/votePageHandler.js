function addObjectToCarousel(collaborationCard, active) {
    const carouselItemMain = document.createElement("div");
    carouselItemMain.className = `carousel-item ${active? "active": ""}`;
    carouselItemMain.appendChild(collaborationCard);
    const carouselItemLeft = carouselItemMain.cloneNode(true);
    const carouselItemRight = carouselItemMain.cloneNode(true);

    document.querySelector("#left_card_carousel .carousel-inner").appendChild(carouselItemLeft);
    document.querySelector("#right_card_carousel .carousel-inner").appendChild(carouselItemRight);
    document.querySelector("#middle_card_carousel .carousel-inner").appendChild(carouselItemMain);
}

async function setUpCarousel(){
    const collaborations = await Data.collaborations();
    const leftCarousel = new bootstrap.Carousel("#left_card_carousel", { interval: false, touch: false });
    const rightCarousel = new bootstrap.Carousel("#right_card_carousel", { interval: false, touch: false });
    const middleCarousel = new bootstrap.Carousel("#middle_card_carousel", { interval: false, touch: false });

    let index = 0;
    for (let collaborationIndex in collaborations){
        const collaboration = collaborations[collaborationIndex];
        await votePageCollaborationCardBuilder(collaboration).then(collaborationCard => {
            if (index < 5) {
                addObjectToCarousel(collaborationCard, index == 0);
            } else
                document.getElementById("collaboration_cards_container").appendChild(collaborationCard);
            index++;
        });
    };

    rightCarousel.nextWhenVisible();
    leftCarousel.prev();
    const leftButton = document.querySelector("#card_carousel_container .carousel-control-prev");
    const rightButton = document.querySelector("#card_carousel_container .carousel-control-next");

    rightButton.addEventListener("click", () => {
        middleCarousel.prev();
        leftCarousel.prev();
        rightCarousel.prev();
    });

    leftButton.addEventListener("click", () => {
        leftCarousel.next();
        middleCarousel.next();
        rightCarousel.next();
    });

    const informationButton = document.querySelector("#search_bar_container > img");
    informationButton.addEventListener("click", () => {
        const newCollaborationModal = new bootstrap.Modal('#card_information_modal', {})
        newCollaborationModal.show();
    });
}

window.onload = async () => {
    const searchInput = document.getElementById("search_bar");
    searchInput.addEventListener("input", filterCollaborationsOnSearch);
    
    await setUpCarousel();
}