/* eslint-disable import/no-duplicates */
/* eslint-disable max-len */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Player from './Player';
import './css/App.css';
import './css/GameScreen.css';

import { getActivePlayer } from './rules';

// animation duration time
const animationDuration = 9000;

class GameScreen extends Component {
    constructor(props) {
        super(props);
        this.state = {
            dragging: null, animation: null,
        };
        this.cardDragStarted = this.cardDragStarted.bind(this);
        this.cardDropped = this.cardDropped.bind(this);
        this.cardDragEnded = this.cardDragEnded.bind(this);
        this.startBirds = this.startBirds.bind(this);
    }

    componentDidMount() {
        this.startBirds();
    }

    componentDidUpdate() {
        if (this.state.animation === 'birds') {
            setTimeout(() => {
                this.setState({ animation: null });
            }, animationDuration);
            clearInterval(this.birdsInterval);
            this.startBirds();
        }
    }

    componentWillUnmount() {
        clearInterval(this.birdsInterval);
    }

    cardDragEnded() {
        this.setState({
            dragging: null,
        });
    }

    cardDragStarted(key, card) {
        console.log('cardDragStarted', key, card);
        this.setState({
            dragging: { key, card },
        });
    }

    cardDropped(target) {
        console.log('Sending message');
        this.props.sendMessage({ type: 'ACTION', activeCard: this.state.dragging.key, target });

        this.setState({
            dragging: null,
        });
    }

    startBirds() {
        // min time delay to start animation
        const minStart = 60000;
        // max time delay to start animation
        const maxStart = 180000;
        // random time delay to start animation between mmin and max values
        const animationStart = Math.floor(Math.random() * (maxStart - minStart + 1)) + minStart;
        console.log('birds animation starts in', animationStart / 60000);
        this.birdsInterval = setInterval(() => {
            this.setState({ animation: 'birds' });
        }, animationDuration + animationStart);
    }

    render() {
        const activePlayer = getActivePlayer(this.props.app);
        return (
            <div className="game-table app-background">
                {this.props.app.game.players.map(player => (
                    <Player
                        item={player.item}
                        key={player.keyHero}
                        position={player.position}
                        player={player}
                        active={player === activePlayer}
                        sendMessage={this.props.sendMessage}
                        dragging={this.state.dragging}
                        cardDropped={this.cardDropped}
                        cardDragStarted={this.cardDragStarted}
                        cardDragEnded={this.cardDragEnded}
                    />
                ))}

                {activePlayer.moveCounter === 0
                    ? (
                        <ChangeTurn
                            players={this.props.app.game.players}
                        />
                    )
                    : null}

                {this.props.app.game.phase === 'OVER'
                    ? (
                        <GameOver
                            players={this.props.app.game.players}
                        />
                    )
                    : null}
                {this.state.animation === 'birds'
                    ? <BirdsAnimation />
                    : null}
            </div>
        );
    }
}

const BirdsAnimation = () => (
    <div className="animation-game-screen">
        <div className="bird-container bird-container-one">
            <div className="bird bird-one" />
        </div>
        <div className="bird-container bird-container-two">
            <div className="bird bird-two" />
        </div>
        <div className="bird-container bird-container-three">
            <div className="bird bird-three" />
        </div>
    </div>
);

const GameOver = (props) => {
    const activePlayer = getActivePlayer(props.app);
    return (
        <div className="gameover">
            {/* for pvp mode: if player is active and alive, the message is 'you win' */}
            {/* <p className="gameover-message">{activePlayer && activePlayer.health.current > 0 ? 'you win' : 'you lose'}</p> */}
            <p className="gameover-message">
                {activePlayer && activePlayer.health.current > 0 ? `${activePlayer.hero} wins` : `${activePlayer.hero} loses`}
            </p>
        </div>
    );
};

const ChangeTurn = (props) => {
    let activePlayer = props.players[0];
    if (props.players[0].active === false) {
        activePlayer = props.players[1];
    }
    return (
        <div className="changeturn">
            <p className="changeturn-message">
                {`${activePlayer.hero}'s turn`}
            </p>
        </div>
    );
};

GameScreen.propTypes = {
    app: PropTypes.object.isRequired,
    sendMessage: PropTypes.func.isRequired,
};

GameOver.propTypes = {
    app: PropTypes.object.isRequired,
};

ChangeTurn.propTypes = {
    players: PropTypes.array.isRequired,
};

export default GameScreen;
