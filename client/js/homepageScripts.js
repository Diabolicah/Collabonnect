//Pull all collaborations from the server and then build the cards for each collaboration
window.onload = async () => {
    const collaborations = await getCollaborationsList();
    //loop through each collaboration and build the card
    collaborations.forEach(async (collaboration) => {
        homePageCollaborationCardBuilder(collaboration)
            .then(collaboration_card => {
                document.getElementById("collaboration_cards_container").appendChild(collaboration_card);
            });
    });
}