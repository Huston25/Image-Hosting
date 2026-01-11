document.addEventListener('DOMContentLoaded', () => {
    const allImgBlock = document.querySelectorAll('.hero__img');
    if (allImgBlock.length === 0) {
        console.log('No images found')
        return
    }
    const randomIndex = Math.floor(Math.random() * allImgBlock.length)
    const randomBlocks = allImgBlock[randomIndex];
    randomBlocks.classList.add('is_visible');

});

document.body.style.setProperty('background-color', '#151515')

document.addEventListener('DOMContentLoaded', () => {
    const showcaseButton = document.querySelector('.header__button-btn');
    if (showcaseButton) {
        showcaseButton.addEventListener('click', () => {
            window.location.href = 'images.html'
        })
    }
})
