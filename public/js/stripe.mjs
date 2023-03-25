const stripe = Stripe(
    'pk_test_51MpCA0DfcEM9cIAmWGiqdhqfCoGX8bIXqDW2miaXFhARb39RzUhokPTAZ6KNPkNfzmY6OiBjN7xzpcXolzo1KclG00YIVSUyC6'
);

const bookTour = async (tourID) => {
    try {
        //1. Get checkout session from API
        const session = await axios(
            `http://127.0.0.1:3000/api/v1/booking/checkout-session/${tourID}`
        );
        //2. Create checkout form + charge credit card
        stripe.redirectToCheckout({
            sessionId: session.data.session.id,
        });
    } catch (error) {
        showAlert('error', error);
    }
};

const bookBtn = document.querySelector('#book-tour');
if (bookBtn) {
    bookBtn.onclick = (e) => {
        e.target.textContent = 'Processing ...';
        const tourId = e.target.dataset.tourId;
        bookTour(tourId);
    };
}
