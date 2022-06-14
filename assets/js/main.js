const drawnImagesContainer = document.querySelector(".container__draw-image");
const addToCollectionBtn = document.querySelector("#add-to-collection-button");
const drawAnotherBtn = document.querySelector("#draw-another-button");

const collectionImagesContainer = document.querySelector(".container__collection-images");
const collectionImageTemplate = document.querySelector(".container__collection-template");

let newImageSource = "";
let templateImageSource = "";

const setNewImage = () => {
    fetch("https://api.thecatapi.com/v1/images/search")
        .then((response) => response.json())
        .then((data) => {
            newImageSource = data[0].url;
            drawnImagesContainer.style.backgroundImage = `url(${newImageSource})`;
        });
};

const addToCollection = () => {
    const templateContent = collectionImageTemplate.content.cloneNode(true);
    templateContent.querySelector(".container__collection-image").style.backgroundImage = `url("${newImageSource}")`;

    if (templateImageSource != `url("${newImageSource}")`) {
        templateImageSource = `url("${newImageSource}")`;
        collectionImagesContainer.appendChild(templateContent);
    } else {
        alert("You've already added this cat!");
    }
};

setNewImage();

drawAnotherBtn.addEventListener("click", setNewImage);
addToCollectionBtn.addEventListener("click", () => {
    if (newImageSource == "") return;
    addToCollection();
});
