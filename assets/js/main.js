const drawnImagesContainer = document.querySelector(".container__draw-image");
const addToCollectionBtn = document.querySelector("#add-to-collection-button");
const drawAnotherBtn = document.querySelector("#draw-another-button");

const collectionElementsAmountOutput = document.querySelector("#collection-elements-amount");
const collectionImagesContainer = document.querySelector(".container__collection-images");
const collectionElementTemplate = document.querySelector(".container__collection-template");
const collectionImagePreviewOutput = document.querySelector(".container__draw-preview");

let drawnImageSource = "";
let collectionElementsAmount = localStorage.collectionElementsAmount || 0;
let currentCollectionElementImageSource = "";
let collectionElementId = 0;

//Initial state based on the local storage.
const setSavedElementsAmount = () => {
    collectionElementsAmountOutput.textContent = collectionElementsAmount;
};

const setSavedCollectionElements = () => {
    if (localStorage.collectionHTML == undefined) return;
    collectionImagesContainer.innerHTML = localStorage.collectionHTML;
};

setSavedElementsAmount();
setSavedCollectionElements();

const toggleLoader = (option) => {
    const loader = document.querySelector(".container__loader");
    if (option == "on") {
        loader.style.display = "block";
    } else {
        loader.style.display = "none";
    }
};

const setNewImageSource = () => {
    toggleLoader("on");
    fetch("https://api.thecatapi.com/v1/images/search")
        .then((response) => response.json())
        .then((data) => {
            drawnImageSource = data[0].url;
            drawnImagesContainer.style.backgroundImage = `url(${drawnImageSource})`;
            toggleLoader("off");
        });
};

setNewImageSource();

const addToCollection = () => {
    const collectionElement = collectionElementTemplate.content.cloneNode(true);
    collectionElement.querySelector(".container__collection-image").style.backgroundImage = `url("${drawnImageSource}")`;
    collectionElement.querySelector(".container__collection-image").setAttribute("id", collectionElementId);
    collectionElement.querySelector("#remove-image").setAttribute("onclick", `removeCollectionElement(${collectionElementId})`);
    collectionElement.querySelector("#preview-image").setAttribute("onclick", `previewCollectionImage("${drawnImageSource}")`);

    isElementInCollection(collectionElement);
    saveCollectionToLocalStorage();
};

const isElementInCollection = (collectionElement) => {
    if (currentCollectionElementImageSource != `url("${drawnImageSource}")`) {
        currentCollectionElementImageSource = `url("${drawnImageSource}")`;
        collectionElementId++;
        collectionElementsAmount++;
        localStorage.collectionElementsAmount = collectionElementsAmount;
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
    localStorage.collectionElementsAmount = collectionElementsAmount;
    setCollectionElementsAmount();
    checkIfCanAddAgain(collectionElementToRemove);
    saveCollectionToLocalStorage();
};

const checkIfCanAddAgain = (collectionElementToRemove) => {
    if (collectionElementToRemove.style.backgroundImage == currentCollectionElementImageSource)
        currentCollectionElementImageSource = "";
};

const saveCollectionToLocalStorage = () => {
    localStorage.collectionHTML = collectionImagesContainer.innerHTML;
};

const previewCollectionImage = (drawnImageSource) => {
    collectionImagePreviewOutput.style.backgroundImage = `url("${drawnImageSource}")`;
};

const setCollectionElementsAmount = () => {
    collectionElementsAmountOutput.textContent = collectionElementsAmount;
};

drawAnotherBtn.addEventListener("click", setNewImageSource);
addToCollectionBtn.addEventListener("click", () => {
    if (drawnImageSource == "") return;
    addToCollection();
});
