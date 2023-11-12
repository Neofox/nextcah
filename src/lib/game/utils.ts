export function selectBlackCard(cards: Card[]) {
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
