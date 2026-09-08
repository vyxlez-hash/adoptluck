import React from 'react';
import { CoinflipGame, FilterTab, User } from '../types';
import { GameCard } from './GameCard';
import { EmptyGamesState } from './EmptyGamesState';

interface GamesListProps {
  games: CoinflipGame[];
  currentUser: User | null;
  onJoinGame: (game: CoinflipGame) => void;
  onWatchGame: (game: CoinflipGame) => void;
  onCancelGame: (gameId: string) => void;
  onCallBot: (game: CoinflipGame) => void;
  onSignInRequired: () => void;
  onCreateClick: () => void;
}

export const GamesList: React.FC<GamesListProps> = ({
  games,
  currentUser,
  onJoinGame,
  onWatchGame,
  onCancelGame,
  onCallBot,
  onSignInRequired,
  onCreateClick,
}) => {
  if (games.length === 0) {
    return (
      <EmptyGamesState
        filter="all"
        user={currentUser}
        onSignInClick={onSignInRequired}
        onCreateClick={onCreateClick}
      />
    );
  }

  return (
    <div className="flex flex-col gap-3.5" id="active-games-list-container">
      {games.map((game) => (
        <GameCard
          key={game.id}
          game={game}
          currentUser={currentUser}
          onJoin={onJoinGame}
          onWatch={onWatchGame}
          onCancel={onCancelGame}
          onCallBot={onCallBot}
          onSignInRequired={onSignInRequired}
        />
      ))}
    </div>
  );
};
