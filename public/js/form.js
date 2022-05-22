window.onload = () => {
    if(sessionStorage.user){
        user = JSON.parse(sessionStorage.user);
        if(user.email){
            location.replace('/');
        }
    }
}


// form
let formBtn = document.querySelector('.submit-btn');
let loader = document.querySelector('.loader');

formBtn.addEventListener('click', () =>{
    let fullname = document.querySelector('#name') || null;
    let email = document.querySelector('#email');
    let password = document.querySelector('#password');
    let number = document.querySelector('#number') || null;
    let tac = document.querySelector('#tc') || null;

    // form validation
    if(fullname != null){// signup
        if (fullname.value.length < 1) {
            showFormError('name must be 1 letter long');
        } else if (!email.value.length) {
            showFormError('enter your email');
        } else if (password.value.length < 6) {
            showFormError('password must be atleast 6 letters long');
        } else if (Number(number) || number.value.length < 10) {
            showFormError('invalid number');
        } else if (!tac.checked) {
            showFormError('you must agree to all terms and conditions');
        } else {
            //submit form
            loader.style.display = 'block';
            sendData('/signup', {
                name: fullname.value,
                email: email.value,
                password: password.value,
                number: number.value,
                tac: tac.checked
            })
        }
    } else{// login page
        if(!email.value.length || !password.value.length){
            showFormError('fill all the inputs')
        }else{
            //submit form
            loader.style.display = 'block';
            sendData('/login', {
                
                email: email.value,
                password: password.value,
                
            })
        }

    }
})

