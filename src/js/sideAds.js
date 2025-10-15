const leftAdContainer = document.getElementById("left-ad");
const rightAdContainer = document.getElementById("right-ad");

// Add your ad images and links here
const leftAds = [
  { src: "src/images/ads/ad1.png", link: "https://example.com/ad1" },
  { src: "src/images/ads/ad2.png", link: "https://example.com/ad2" }
];

const rightAds = [
  { src: "src/images/ads/ad3.png", link: "https://example.com/ad3" },
  { src: "src/images/ads/ad4.png", link: "https://example.com/ad4" }
];

let leftIndex = 0;
let rightIndex = 0;

// Function to display an ad
function displayAd(container, ads, index) {
  container.innerHTML = `<a href="${ads[index].link}" target="_blank">
      <img src="${ads[index].src}" alt="Advertisement">
    </a>`;
}

// Initial display
displayAd(leftAdContainer, leftAds, leftIndex);
displayAd(rightAdContainer, rightAds, rightIndex);

// Rotate ads every 5 seconds
setInterval(() => {
  leftIndex = (leftIndex + 1) % leftAds.length;
  displayAd(leftAdContainer, leftAds, leftIndex);

  rightIndex = (rightIndex + 1) % rightAds.length;
  displayAd(rightAdContainer, rightAds, rightIndex);
}, 5000);
