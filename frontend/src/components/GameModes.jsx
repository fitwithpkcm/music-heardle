const routes={song:'song-game',dialogue:'dialogue-game',clues:'clue-game',lyrics:'lyrics-game'}
export default function GameModes({game,buzzer=false}){
 return <nav className="game-modes" aria-label="Play mode">
 <a href={`#${routes[game]}`} aria-current={!buzzer?'page':undefined}>{game==='lyrics'?'Host / online play':'Normal play'}</a>
 <a href={`#buzzer-game?game=${game}`} aria-current={buzzer?'page':undefined}>Play with buzzer</a>
 </nav>
}
