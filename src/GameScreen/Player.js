/* eslint-disable no-unused-expressions */
/* eslint-disable consistent-return */
/* eslint-disable no-nested-ternary */
/* eslint-disable import/no-duplicates */

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import UIFx from 'uifx';
import Hero from './Hero';
import Card from './Card';
import Hand from './Hand';
import rules from '../rules';
import '../css/App.css';
import '../css/GameScreen.css';
import graveyard from '../images/cards/graveyard.png';
import bat from '../images/cards/batCard.png';

const attackSound = new UIFx(`${process.env.PUBLIC_URL}/sound/attack.mp3`, { volume: 1.0 });
const graveyardSound = new UIFx(`${process.env.PUBLIC_URL}/sound/graveyard.mp3`, { volume: 0.1 });

const Animation = (props) => (
    <div className="stack">
        <div className={`deck card-like deck-${props.background} one`} />
        <div className={`deck card-like deck-${props.background} two`} />
        <div className={`deck card-like deck-${props.background} three`} />
    </div>
);

const AnimatedHand = ({ hand, player }) => (
    <div className="hand card-hand">
        {Object.keys(hand).map((cardId) => (
            <div key={cardId} className="card-place card-like">
                <Card cardKey={cardId} card={hand[cardId]} player={player} />
            </div>
        ))}
    </div>
);

// Clairvoyance showed 3 1st cards from deck -from backend
// this function create them to appear with 3 different
// classNames for each to create different animation
function Clairvoyance({ player }) {
    const findPosition = (index) => {
        if (index === 2) {
            return 'upper';
        }
        if (index === 1) {
            return 'middle';
        }
        if (index === 0) {
            return 'bottom';
        }
    };

    return (
        <div>
            {Object.keys(player.cardsShown).map((cardId, index) => (
                <div
                    key={cardId}
                    className={`card-place card-like clairvoyance ${findPosition(index)}`}
                >
                    <Card
                        cardKey={cardId}
                        card={player.cardsShown[cardId]}
                        player={player}
                    />
                </div>
            ))}
        </div>
    );
}

// bat card image for malachite box card
// once in item holder, malachite box generates bat card
// that attacks opponent with any other player action
const BatCard = () => (
    <div className="item-attacks">
        <img className="bat-img" src={bat} alt="bat card" />
    </div>
);

class Player extends Component {
    constructor(props) {
        super(props);
        this.state = {
            animation: null,
        };
        this.cardOver = this.cardOver.bind(this);
        this.isTarget = this.isTarget.bind(this);
        this.cardDropped = this.cardDropped.bind(this);
        this.playAnimation = this.playAnimation.bind(this);
        this.malachiteBox = this.malachiteBox.bind(this);
        this.actionSound = this.actionSound.bind(this);
    }

    componentDidUpdate(prevProps) {
    // Typical usage (don't forget to compare props):
    // animation for cards deal from gravyeard to deck
        if (this.props.player.deal !== prevProps.player.deal) {
            this.playAnimation('cards');
            // animation for Turning Potion - active player gets cards from inactive player hand
            // doesn't work ---> to be fixed!
        }
        if (
            this.props.player.turningHand !== prevProps.player.turningHand
      && this.props.player.turningHand === true
        ) {
            this.playAnimation('potion');
        }
    }

    playAnimation(animName) {
        console.log('We are in Animation!', animName);
        this.setState({ animation: animName });
        setTimeout(() => this.setState({ animation: null }), 2000);
    }

    isTarget(target) {
        return rules(
            target,
            this.props.dragging,
            this.props.active,
            this.props.player,
        );
    }

    cardOver(event, target) {
        if (!this.isTarget(target)) {
            return;
        }
        event.preventDefault();
    }

    actionSound(target) {
        // we play attack sound if active player attacks opponent or its item
        if (!this.props.active && target !== 'graveyard') {
            if (this.isTarget(target)) {
                attackSound.play();
            }
        }
        // we play graveyard sound if player drops card to graveyard
        if (target === 'graveyard') {
            graveyardSound.play();
        }
    }

    malachiteBox() {
        // we define item of active player if any
        let itemActive;
        Object.keys(this.props.activePlayer.item) !== undefined
            ? (itemActive = Object.values(this.props.activePlayer.item)[0])
            : null;
        // we define active player if she / he has Malachite box in item
        let playerWithMalachiteBox;
        itemActive && itemActive.category === 'generator'
            ? playerWithMalachiteBox = this.props.activePlayer.hero : null;
        // if active player has malachite box card
        // every other card drop calls animation of bat card
        itemActive && itemActive.category === 'generator' && this.props.activePlayer.hero === playerWithMalachiteBox
            ? this.playAnimation('bat') && attackSound.play()
            : null;
    }

    cardDropped(target) {
        // we run malachite box function to check
        // this card and execute it if any
        this.malachiteBox();

        if (!this.isTarget(target)) {
            return;
        }
        this.props.cardDropped(target);
        // we run actionSound function to play sound once player acts
        this.actionSound(target);
    }

    render() {
        const playerClass = this.props.active ? 'player-active' : 'player-inactive';
        const playerPosition = this.props.player.position === 'bottom'
            ? 'player player-bottom'
            : 'player player-top';
        return (
            <div className={`${playerPosition} ${playerClass}`}>
                <Hero
                    player={this.props.player}
                    cardDropped={this.cardDropped}
                    cardOver={this.cardOver}
                    isTarget={this.isTarget}
                    active={this.props.active}
                />
                <Item
                    item={Object.values(this.props.player.item)[0]}
                    isTarget={this.isTarget}
                    cardDropped={this.cardDropped}
                    cardOver={this.cardOver}
                    player={this.props.player}
                    cardDragStarted={this.props.cardDragStarted}
                    cardDragEnded={this.props.cardDragEnded}
                    active={this.props.active}
                />
                {this.state.animation === 'bat' ? <BatCard /> : null}
                <Deck
                    active={this.props.active}
                    cards={this.props.player.cards}
                    background={this.props.player.background}
                />
                {this.props.player.cardsShown ? (
                    <Clairvoyance player={this.props.player} active={this.props.active} />
                ) : null}
                <Hand
                    active={this.props.active}
                    dragging={this.props.dragging}
                    // hand={this.props.player.hand}
                    hand={this.props.hand}
                    cardDragStarted={this.props.cardDragStarted}
                    cardDragEnded={this.props.cardDragEnded}
                    isTarget={this.isTarget}
                    player={this.props.player}
                />
                {/* {this.state.animation === "potion" ? ( */}
                {this.props.active ? null : this.state.animation === 'potion' ? (
                    <AnimatedHand hand={this.props.hand} player={this.props.player} />
                ) : null}
                <Grave
                    player={this.props.player}
                    active={this.props.active}
                    grave={this.props.player.grave}
                    isTarget={this.isTarget}
                    cardDropped={this.cardDropped}
                    cardOver={this.cardOver}
                    background={this.props.player.background}
                    animation={this.state.animation}
                />
            </div>
        );
    }
}

const Deck = (props) => (
    <div className={`deck card-like deck-${props.background}`}>
        <div className="count">
            {props.active
                ? Object.keys(props.cards).length
                : Object.keys(props.cards).length}
        </div>
    </div>
);

const Grave = (props) => (
    <div
        className={`grave card-like  grave-${props.background} ${
            props.isTarget('graveyard') ? 'target' : null
        }`}
        style={{
            backgroundImage: `url(${graveyard})`,
            backgroundSize: '100% 100%',
        }}
        id={props.active ? 'grave' : null}
        XonDrop={() => props.cardDropped('graveyard')}
        onClick={() => props.cardDropped('graveyard')}
        XonDragOver={(e) => props.cardOver(e, 'graveyard')}
    >
        <div className="count">
            {props.active
                ? Object.keys(props.grave).length
                : Object.keys(props.grave).length}
        </div>
        {props.animation === 'cards' ? (
            <Animation background={props.background} />
        ) : null}
    </div>
);

const Item = (props) => (
    <div
        className={`item card-place card-like
            ${props.player.background}
            ${props.isTarget('item') ? 'target' : null}
            ${
    props.isTarget('itemOpponent')
              && props.item
              && props.item.category !== 'shield'
        ? 'target'
        : null
    }
        `}
        id={props.active ? 'item' : null}
        xonDrop={
            // eslint-disable-next-line no-nested-ternary
            props.active
                ? () => props.cardDropped('item', Object.keys(props.player.item))
                : props.item
                    ? () => props.cardDropped('itemOpponent')
                    : null
        }
        onClick={
            // eslint-disable-next-line no-nested-ternary
            props.active
                ? () => props.cardDropped('item', Object.keys(props.player.item))
                : props.item
                    ? () => props.cardDropped('itemOpponent')
                    : null
        }
        onDragOver={
            // eslint-disable-next-line no-nested-ternary
            props.active
                ? (e) => props.cardOver(e, 'item')
                : props.item
                    ? (e) => props.cardOver(e, 'itemOpponent')
                    : null
        }
    >
        {props.item ? (
            <Card
                card={props.item}
                player={props.player}
                cardKey={Object.keys(props.player.item)[0]}
                draggable={props.active}
                cardDragStarted={props.cardDragStarted}
                cardDragEnded={props.cardDragEnded}
            />
        ) : null}
    </div>
);

Deck.propTypes = {
    cards: PropTypes.object.isRequired,
    background: PropTypes.string.isRequired,
    active: PropTypes.bool.isRequired,
};

Player.propTypes = {
    player: PropTypes.object.isRequired,
    hand: PropTypes.object.isRequired,
    cardDragStarted: PropTypes.func.isRequired,
    cardDragEnded: PropTypes.func.isRequired,
    cardDropped: PropTypes.func.isRequired,
    dragging: PropTypes.object,
    active: PropTypes.bool.isRequired,
    activePlayer: PropTypes.object.isRequired,
};

Player.defaultProps = {
    dragging: null,
};

Grave.propTypes = {
    grave: PropTypes.object.isRequired,
    active: PropTypes.bool.isRequired,
    isTarget: PropTypes.func.isRequired,
    cardDropped: PropTypes.func.isRequired,
    cardOver: PropTypes.func.isRequired,
    background: PropTypes.string.isRequired,
    animation: PropTypes.string,
};

Grave.defaultProps = {
    animation: null,
};

Item.propTypes = {
    player: PropTypes.object.isRequired,
    item: PropTypes.object,
    isTarget: PropTypes.func.isRequired,
    cardDragStarted: PropTypes.func,
    cardDragEnded: PropTypes.func,
    cardOver: PropTypes.func.isRequired,
    cardDropped: PropTypes.func.isRequired,
    active: PropTypes.bool.isRequired,
};

Item.defaultProps = {
    item: null,
    cardDragStarted: null,
    cardDragEnded: null,
};

Animation.propTypes = {
    background: PropTypes.string.isRequired,
};

Hand.propTypes = {
    hand: PropTypes.object.isRequired,
};

AnimatedHand.propTypes = {
    hand: PropTypes.object.isRequired,
    player: PropTypes.object.isRequired,
};

Clairvoyance.propTypes = {
    player: PropTypes.object.isRequired,
};

export default Player;
