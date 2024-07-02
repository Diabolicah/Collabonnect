function addObjectToCarousel(collaboration_card, active) {
    const carousel_item_main = document.createElement("div");
    carousel_item_main.className = `carousel-item ${active? "active": ""}`;
    carousel_item_main.appendChild(collaboration_card);
    const carousel_item_left = carousel_item_main.cloneNode(true);
    const carousel_item_right = carousel_item_main.cloneNode(true);
    
    document.querySelector("#left_card_carousel .carousel-inner").appendChild(carousel_item_left);
    document.querySelector("#right_card_carousel .carousel-inner").appendChild(carousel_item_right);
    document.querySelector("#middle_card_carousel .carousel-inner").appendChild(carousel_item_main);
}


window.onload = async () => {
    const collaborations = await getCollaborationsList();
    const left_carousel = new bootstrap.Carousel("#left_card_carousel", { interval: false });
    const right_carousel = new bootstrap.Carousel("#right_card_carousel", { interval: false });
    const middle_carousel = new bootstrap.Carousel("#middle_card_carousel", { interval: false });

    let index = 0;
    await collaborations.forEach(async (collaboration) => {
        votePageCollaborationCardBuilder(collaboration)
            .then(collaboration_card => {
                if (index < 5) {
                    addObjectToCarousel(collaboration_card, index == 0);
                } else
                    document.getElementById("collaboration_cards_container").appendChild(collaboration_card);
                index++;
            });
    });


    right_carousel.nextWhenVisible();
    left_carousel.prev();
    const left_button = document.querySelector("#card_carousel_container .carousel-control-prev");
    const right_button = document.querySelector("#card_carousel_container .carousel-control-next");

    left_button.addEventListener("click", () => {
        middle_carousel.prev();
        left_carousel.prev();
        right_carousel.prev();
    });

    right_button.addEventListener("click", () => {
        left_carousel.next();
        middle_carousel.next();
        right_carousel.next();
    });

    const information_button = document.querySelector("#search_bar_container > img");
    information_button.addEventListener("click", () => {
        const newCollaborationModal = new bootstrap.Modal('#cardInformationModal', {})
        newCollaborationModal.show();
    });
}