export default function isTarget(target, dragging, active, player) {
    if (!dragging) {
        return false;
    }
    if (!active) {
        // console.log(player.item);
        let itemCategory;
        const itemKey = Object.keys(player.item)[0];
        // eslint-disable-next-line no-unused-expressions
        itemKey ? itemCategory = player.item[itemKey].category : null;
        // console.log(itemCategory);
        return (
            (target === 'opponent' && dragging.card.category === 'attack')
                || (target === 'itemOpponent' && dragging.card.category === 'attack' && itemCategory !== 'shield')
        );
    }
    return (
        (target === 'hero' && dragging.card.category === 'heal')
            || (target === 'item' && dragging.card.type === 'item')
            || (target === 'graveyard')
    );
}
