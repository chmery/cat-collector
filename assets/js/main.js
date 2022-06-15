const drawnImagesContainer = document.querySelector(".container__draw-image");
const addToCollectionBtn = document.querySelector("#add-to-collection-button");
const drawAnotherBtn = document.querySelector("#draw-another-button");

const collectionElementsAmountOutput = document.querySelector("#collection-elements-amount");
const collectionImagesContainer = document.querySelector(".container__collection-images");
const collectionElementTemplate = document.querySelector(".container__collection-template");

let drawnImageSource = "";
let collectionElementsAmount = 0;
let currentCollectionElementImageSource = "";
let collectionElementId = 0;

const setNewImageSource = () => {
    fetch("https://api.thecatapi.com/v1/images/search")
        .then((response) => response.json())
        .then((data) => {
            drawnImageSource = data[0].url;
            drawnImagesContainer.style.backgroundImage = `url(${drawnImageSource})`;
        });
};

const addToCollection = () => {
    const collectionElement = collectionElementTemplate.content.cloneNode(true);
    collectionElement.querySelector(".container__collection-image").style.backgroundImage = `url("${drawnImageSource}")`;
    collectionElement.querySelector(".container__collection-image").setAttribute("id", collectionElementId);
    collectionElement.querySelector("#remove-image").setAttribute("onclick", `removeCollectionElement(${collectionElementId})`);

    if (currentCollectionElementImageSource != `url("${drawnImageSource}")`) {
        currentCollectionElementImageSource = `url("${drawnImageSource}")`;
        collectionElementId++;
        collectionElementsAmount++;
        setCollectionElementsAmount();
        collectionImagesContainer.appendChild(collectionElement);
    } else {
        alert("You've already added this cat!");
    }
};

const removeCollectionElement = (collectionElementId) => {
    const collectionElementToRemove = document.getElementById(collectionElementId);
    collectionElementToRemove.remove();
    collectionElementsAmount--;
    setCollectionElementsAmount();
    checkIfCanAddAgain(collectionElementToRemove);
};

const checkIfCanAddAgain = (collectionElementToRemove) => {
    if (collectionElementToRemove.style.backgroundImage == currentCollectionElementImageSource)
        currentCollectionElementImageSource = "";
};

const setCollectionElementsAmount = () => {
    collectionElementsAmountOutput.textContent = collectionElementsAmount;
};

//setNewImageSource();

drawAnotherBtn.addEventListener("click", setNewImageSource);
addToCollectionBtn.addEventListener("click", () => {
    if (drawnImageSource == "") return;
    addToCollection();
});
