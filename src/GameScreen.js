import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Hero from './Hero';
import './css/App.css';
import './css/GameScreen.css';

const GameScreen = (props) => {
    props.app.game.players.sort((a, b) => {
        const x = a.active;
        const y = b.active;
        return x < y ? -1 : 1;
    });
    return (
        <div className="game-table app-background">
            {props.app.game.players.map(player => (
                <Player key={player.hero} player={player} sendMessage={props.sendMessage}/>
            ))}
        </div>
    );
};

const Card = props => (
    <div className="card card-like" data-key={props.cardKey} draggable={props.draggable} onDragStart={props.cardDragStarted} onDragEnd={props.cardDragEnded}>
        <div className="card-name">
            {props.card.name}
            {props.cardKey}
        </div>
    </div>
);

const Deck = props => (
    <div className="deck card-like">
        <div className="deck-name" props={props}>
            deck
        </div>
    </div>
);

const Hand = props => (
    <div className="hand">
        {Object.keys(props.hand).map(cardId => (
            <div key={cardId} className="card-place card-like">
                <Card cardKey={cardId} card={props.hand[cardId]} draggable={props.active} cardDragStarted={props.cardDragStarted} cardDragEnded={props.cardDragEnded}/>
            </div>
        ))}
    </div>
);

const Grave = props => (
    <div className={"grave card-like "+ (props.target ? 'target' : null)} id={props.active ? 'grave' : null} onDrop={props.cardDropped} onDragOver={props.cardOver}>
        <div className="grave-name">
          grave
        </div>
        <div className="count">
            {props.active ? Object.keys(props.grave).length : null}
        </div>
    </div>
);

const Item = props => (
    <div className="item card-place card-like" id={props.active ? 'item' : null}>
        {props.item ? <Card card={props.item} /> : null}
    </div>
);

class Player extends Component {
    constructor(props) {
        super(props);
        this.state = { item: null, dragging: null};
        this.cardDragStarted = this.cardDragStarted.bind(this);
        this.cardDropped = this.cardDropped.bind(this);
        this.cardOver = this.cardOver.bind(this);
        this.isGraveTarget = this.isGraveTarget.bind(this);
        this.cardDragEnded = this.cardDragEnded.bind(this);
    }

    isGraveTarget(){
      return this.props.player.active && this.state.dragging ? true : false;
    }

    cardDragEnded(event) {
      this.setState ({
        dragging: null
      });
    }

    cardDragStarted(event) {
      this.setState ({
        dragging: event.target.dataset.key
      });
   }

   cardOver(event) {
     if(!this.isGraveTarget()) {
       return;
     }
     event.preventDefault();
   }

   cardDropped(event) {
     console.log("Sending message");
     this.props.sendMessage({ type: 'ACTION',  activeCard: this.state.dragging, target: 'graveyard' });
     this.setState ({
       dragging: null
     });
   }


    render() {
        return (
            <div className={this.props.player.active ? 'player player-active' : 'player player-inactive'}>
                <Hero player={this.props.player} />
                <Item active={this.props.player.active} item={this.state.item} />
                <Deck deck={this.props.player.deck} />
                <Hand active={this.props.player.active} hand={this.props.player.hand} cardDragStarted={this.cardDragStarted} cardDragEnded={this.cardDragEnded}/>
                <Grave
                  active={this.props.player.active}
                  grave={this.props.player.grave}
                  target={this.isGraveTarget()}
                  cardDropped={this.cardDropped}
                  cardOver={this.cardOver}/>
            </div>
        );
    }
}

Player.propTypes = {
    player: PropTypes.object.isRequired,
};

Hand.propTypes = {
    active: PropTypes.bool.isRequired,
    hand: PropTypes.object.isRequired,
};

Card.propTypes = {
    card: PropTypes.object.isRequired,
    draggable: PropTypes.bool.isRequired,
};

Grave.propTypes = {
    grave: PropTypes.object.isRequired,
    active: PropTypes.bool.isRequired,
    target: PropTypes.bool.isRequired,
};

Item.propTypes = {
    item: PropTypes.object,
    active: PropTypes.bool.isRequired,
};

Item.defaultProps = {
    item: null,
};

GameScreen.propTypes = {
    app: PropTypes.object.isRequired,
};

export default GameScreen;
