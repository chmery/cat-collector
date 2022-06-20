const drawnImagesContainer = document.querySelector(".container__draw-image");
const addToCollectionBtn = document.querySelector("#add-to-collection-button");
const drawAnotherBtn = document.querySelector("#draw-another-button");
const removeAllSelectedBtn = document.querySelector(".container__collection-remove-selected");

const collectionElementsAmountOutput = document.querySelector("#collection-elements-amount");
const collectionImagesContainer = document.querySelector(".container__collection-images");
const collectionElementTemplate = document.querySelector(".container__collection-template");
const collectionImagePreviewOutput = document.querySelector(".container__draw-preview");

const usedIdNumbers = JSON.parse(localStorage.getItem("usedIdNumbers")) || [];

let drawnImageSource = "";
let collectionElementsAmount = localStorage.collectionElementsAmount || 0;
let currentCollectionElementImageSource = "";
let collectionElementId = 0;

//Initial state based on the local storage.
const setSavedElementsAmount = () => {
    collectionElementsAmountOutput.textContent = collectionElementsAmount;
};

const setSavedCollectionElements = () => {
    if (localStorage.collectionHTML === undefined) return;
    collectionImagesContainer.innerHTML = localStorage.collectionHTML;
};

setSavedElementsAmount();
setSavedCollectionElements();

const toggleLoader = (option) => {
    const loader = document.querySelector(".container__loader");
    option === "on" ? (loader.style.display = "block") : (loader.style.display = "none");
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

//setNewImageSource();

const isIdUsed = () => {
    if (elementInCollection()) return;
    const isIdInArray = () => {
        return usedIdNumbers.some((item) => item === collectionElementId);
    };

    while (isIdInArray() && usedIdNumbers !== 0) {
        collectionElementId++;
    }

    usedIdNumbers.push(collectionElementId);
    localStorage.setItem("usedIdNumbers", JSON.stringify(usedIdNumbers));
};

const elementInCollection = () => {
    if (currentCollectionElementImageSource === `url("${drawnImageSource}")`) return true;
    return false;
};

const addToCollection = () => {
    isIdUsed();
    const collectionElement = collectionElementTemplate.content.cloneNode(true);

    const setBackgroundImage = () => {
        collectionElement.querySelector(".container__collection-image").style.backgroundImage = `url("${drawnImageSource}")`;
    };

    const setCollectionElementId = () => {
        collectionElement.querySelector(".container__collection-image").setAttribute("id", collectionElementId);
    };

    const setOnClickFunctions = () => {
        collectionElement
            .querySelector("#remove-image")
            .setAttribute("onclick", `event.stopPropagation(); removeSingleElement(${collectionElementId});`);
        collectionElement
            .querySelector("#preview-image")
            .setAttribute("onclick", `event.stopPropagation(); previewCollectionImage("${drawnImageSource}");`);
        collectionElement
            .querySelector(".container__collection-image")
            .setAttribute("onclick", `markAsSelected(${collectionElementId})`);
    };

    if (isElementInCollection() === false) {
        setBackgroundImage();
        setCollectionElementId();
        setOnClickFunctions();
        collectionImagesContainer.appendChild(collectionElement);
    } else {
        alert("You've already added this cat!");
    }

    saveCollectionToLocalStorage();
};

const isElementInCollection = () => {
    if (currentCollectionElementImageSource != `url("${drawnImageSource}")`) {
        currentCollectionElementImageSource = `url("${drawnImageSource}")`;
        collectionElementId++;
        collectionElementsAmount++;
        setCollectionElementsAmount();
        return false;
    } else {
        return true;
    }
};

let selectedCollectionElements = [];

const markAsSelected = (collectionElementId) => {
    const selectedElement = document.getElementById(collectionElementId);
    if (selectedElement.style.boxShadow === "") {
        selectedElement.style.boxShadow = "0px 0px 0px 4px #F9D252";
        selectedCollectionElements.push(collectionElementId);
    } else {
        selectedElement.style.boxShadow = "";
        removeIdFromArraySelected(collectionElementId);
    }
    setRemoveAllSelectedButton();
    console.log(selectedCollectionElements);
};

const setRemoveAllSelectedButton = () => {
    selectedCollectionElements.length > 0
        ? (removeAllSelectedBtn.style.display = "block")
        : (removeAllSelectedBtn.style.display = "none");
};

const removeAllSelected = () => {
    const confirmSelectedRemoval = confirm("Are you sure you want to remove all selected cats?");
    if (confirmSelectedRemoval) {
        selectedCollectionElements.forEach((element) => {
            removeCollectionElement(element);
        });
        selectedCollectionElements.length = 0;
        setRemoveAllSelectedButton();
    }
};

const removeSingleElement = (collectionElementId) => {
    const confirmRemoval = confirm("Are you sure you want to delete this cat?");
    if (confirmRemoval) removeCollectionElement(collectionElementId);
};

const removeCollectionElement = (collectionElementId) => {
    const collectionElementToRemove = document.getElementById(collectionElementId);
    removeElement(collectionElementToRemove);
    setCollectionElementsAmount();
    saveCollectionToLocalStorage();
    checkIfCanAddAgain(collectionElementToRemove);
    removeIdFromArraySelected(collectionElementId);
    setRemoveAllSelectedButton();
    resetIfPossible();
};

const removeElement = (collectionElementToRemove) => {
    collectionElementToRemove.remove();
    collectionElementsAmount--;
};

const removeIdFromArraySelected = (collectionElementId) => {
    const afterDeselect = selectedCollectionElements.filter((item) => item !== collectionElementId);
    selectedCollectionElements = afterDeselect;
};

const checkIfCanAddAgain = (collectionElementToRemove) => {
    if (collectionElementToRemove.style.backgroundImage == currentCollectionElementImageSource)
        currentCollectionElementImageSource = "";
};

const resetIfPossible = () => {
    if (collectionElementsAmount === 0) {
        usedIdNumbers.length = 0;
        collectionElementId = 0;
    }
};

const saveCollectionToLocalStorage = () => {
    localStorage.collectionHTML = collectionImagesContainer.innerHTML;
};

const previewCollectionImage = (drawnImageSource) => {
    collectionImagePreviewOutput.style.backgroundImage = `url("${drawnImageSource}")`;
};

const setCollectionElementsAmount = () => {
    localStorage.collectionElementsAmount = collectionElementsAmount;
    collectionElementsAmountOutput.textContent = collectionElementsAmount;
};

removeAllSelectedBtn.addEventListener("click", removeAllSelected);
drawAnotherBtn.addEventListener("click", setNewImageSource);
addToCollectionBtn.addEventListener("click", () => {
    if (drawnImageSource === "") return;
    addToCollection();
});
