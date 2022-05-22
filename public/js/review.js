let ratingStarInput = [...document.querySelectorAll('.rating-star')];
let rate = 0;


ratingStarInput.map((star, index) => {
    star.addEventListener('click', () => {
        for (let i = 0; i < 5; i++) {
            if (i <= index) {
                ratingStarInput[i].src = `img/fill star.png`;
            } else {
                ratingStarInput[i].src = `img/no fill star.png`;
            }
        }
    })
})

// add review form 
let reviewHeadline = document.querySelector('.review-headline');
let review = document.querySelector('.review-field');
let loader = document.querySelector('.loader');

let addReviewBtn = document.querySelector('.add-review-btn');

addReviewBtn.addEventListener('click', () => {
    //form validation
    let user = JSON.parse(sessionStorage.user || null);
    window.onload = () => {
        if (user == null) {
            location.replace('/login')
        }
    }
})