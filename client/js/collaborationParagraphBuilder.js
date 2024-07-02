function createDefaultParagraph(paragraphDetails, isEditMode){
    isEditMode = isEditMode || false;
    console.log(isEditMode);
    const paragraph = document.createElement("section");
    paragraph.classList.add("paragraph");

    const paragraphTitleStatus = document.createElement("section");
    paragraphTitleStatus.classList.add("paragraph_title_and_status");
    let title;
    if(isEditMode) {
        title = document.createElement("input");
        title.value = paragraphDetails.title;
    }else {
        title = document.createElement("h2");
        title.textContent = paragraphDetails.title;
    }
    const status = document.createElement("section");
    if(paragraphDetails.status == "Pending"){
        status.classList.add("pending");
        status.textContent = paragraphDetails.status;
    }else {
        status.textContent = "Up to date";
    }

    let paragraphText;
    if(isEditMode) {
        paragraphText = document.createElement("textarea");
        paragraphText.value = paragraphDetails.text;
    }else {
        paragraphText = document.createElement("p");
        paragraphText.textContent = paragraphDetails.text;
    }

    paragraph.appendChild(paragraphTitleStatus);
    paragraphTitleStatus.appendChild(title);
    paragraphTitleStatus.appendChild(status);
    paragraph.appendChild(paragraphText);

    return paragraph;
}

{/* <section class="paragraph">
<section class="paragraph_title_and_status">
    <h2>Paragraph 2</h2>
    <section class="pending">Pending</section>
</section>
<section class="paragraph_image_video">
    <img class="paragraph_image" src="./images/image_placeholder.svg" alt="image_placeholder">
    <!-- <iframe class="paragraph_video" src="https://www.youtube.com/embed/YwJotfRP1MI" frameborder="0" allowfullscreen></iframe> -->
</section>
<p>
    Lorem ipsum dolor sit amet, consectetur adipiscing elit. Cras sagittis
    bibendum laoreet. Vestibulum velit tortor, maximus eu scelerisque ut,
    venenatis sit amet augue. Quisque semper nulla feugiat libero molestie
    faucibus. Vestibulum sit amet urna orci. Vestibulum ante ipsum primis in
    faucibus orci luctus et ultrices posuere cubilia curae; Donec ut dictum
    metus. Quisque eu tellus luctus, fermentum risus in, tincidunt diam. In
    tristique, turpis in porttitor vestibulum, tellus ipsum elementum nisi,
    a faucibus eros ante ac nunc. Interdum et malesuada fames ac ante ipsum
    primis in faucibus.
</p>
</section> */}

function addImage(paragraph, paragraphDetails, isEditMode) {
    isEditMode = isEditMode || false;
    let paragraphImageVideo = paragraph.querySelector("paragraph_image_video");
    if(!paragraphImageVideo){
        paragraphImageVideo = document.createElement("section");
        paragraphImageVideo.classList.add("paragraph_image_video");
        if(isEditMode){
            paragraph.appendChild(paragraphImageVideo);
            paragraph.classList.add("edit_mode");
        }
        else paragraph.querySelector(".paragraph_title_and_status").after(paragraphImageVideo);
    }
    const paragraphImg = document.createElement("img");
    paragraphImg.src = isEditMode ? "./images/upload_placeholder.svg": `${domain}/assets/profile_images/${paragraphDetails.image}`;
    paragraphImg.alt = "image_placeholder";
    paragraphImg.classList.add("paragraph_image");

    paragraphImageVideo.appendChild(paragraphImg);

    return paragraph;
}

function createParagraph(paragraphDetails, isEditMode){
    isEditMode = isEditMode || false;
    let paragraph = createDefaultParagraph(paragraphDetails, isEditMode);
    if(paragraphDetails.image && paragraphDetails.video){
        return paragraph = addImageAndVideo(paragraph, paragraphDetails, isEditMode);
    }else if(paragraphDetails.image){
        return paragraph = addImage(paragraph, paragraphDetails, isEditMode);
    }else if(paragraphDetails.video){
        return paragraph = addVideo(paragraph, paragraphDetails, isEditMode);
    }

    return paragraph;
}