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
    console.log(round_users);
    const findTzarIndex = round_users.findIndex(round_user => round_user.is_tzar);
    console.log(findTzarIndex);
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

export function pickWhiteCards(cards: Card[], numberOfCards = 10): Card[] {
    const whiteCards = cards.filter(card => card.color === "white");

    if (cards.length === 0) {
        throw new Error("No cards provided");
    }

    if (numberOfCards > whiteCards.length) {
        throw new Error("Number of cards is greater than the number of cards provided");
    }

    const randomIndexes: number[] = [];

    // make sure to have 10 unique cards
    while (randomIndexes.length !== numberOfCards) {
        const randomIndex = Math.floor(Math.random() * whiteCards.length);
        if (!randomIndexes.includes(randomIndex)) {
            randomIndexes.push(randomIndex);
        }
    }

    return randomIndexes.map(index => whiteCards[index]);
}
