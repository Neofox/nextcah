export function selectBlackCard(cards: Card[]): Card {
    if (cards.length === 0) {
        throw new Error("No cards provided");
    }

    const blackCards = cards.filter(card => card.color === "black");

    if (blackCards.length === 0) {
        throw new Error("No black cards found");
    }

    const randomIndex = Math.floor(Math.random() * blackCards.length);

    return blackCards[randomIndex];
}

export function selectTzar(round_users: RoundUser[]): RoundUser {
    const findTzarIndex = round_users.findIndex(round_user => round_user.is_tzar);

    // if no tzar just choose a random one
    if (findTzarIndex === -1) {
        const randomIndex = Math.floor(Math.random() * round_users.length);
        return round_users[randomIndex];
    }

    // if tzar is the last one choose the first one as tzar
    if (findTzarIndex === round_users.length - 1) {
        return round_users[0];
    }

    return round_users[findTzarIndex + 1];
}

export function pickWhiteCards(cards: Card[], numberOfCards = 10, hand: number[]): Card[] {
    // if no cards needs to be picked just return an empty array
    if (numberOfCards < 1) {
        return [];
    }

    const whiteCards = cards.filter(card => card.color === "white");

    if (whiteCards.length === 0) {
        throw new Error("No white cards found");
    }

    if (numberOfCards > whiteCards.length) {
        throw new Error("Number of cards is greater than the number of cards provided");
    }

    const pickedWhiteCards: Card[] = [];

    // make sure to have 10 unique cards
    while (pickedWhiteCards.length !== numberOfCards) {
        const randomIndex = Math.floor(Math.random() * whiteCards.length);
        const pickedWhiteCard = whiteCards[randomIndex];

        if (!hand.includes(pickedWhiteCard.id) && !pickedWhiteCards.find(card => card.id === pickedWhiteCard.id)) {
            pickedWhiteCards.push(pickedWhiteCard);
        }
    }

    return pickedWhiteCards;
}
